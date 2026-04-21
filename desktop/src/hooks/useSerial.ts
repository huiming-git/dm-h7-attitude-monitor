import { useState, useRef, useCallback, useEffect } from "react";
import { SerialPort } from "tauri-plugin-serialplugin";
import { FrameParser, type AttitudeData, type RawImuData } from "../protocol";
import { TrajectoryEstimator, type TrajectoryPoint } from "../trajectory";

interface PortEntry {
  path: string;
  manufacturer?: string;
}

export interface DeviceInfo {
  id: string;
  port: string;
  name: string;
}

export interface SerialState {
  ports: PortEntry[];
  connected: boolean;
  currentPort: string;
  devices: DeviceInfo[];
  activeDeviceId: string;
  attitude: AttitudeData | null;
  rawImu: RawImuData | null;
  attitudeHistory: AttitudeData[];
  rawHistory: RawImuData[];
  fps: number;
  error: string | null;
  trajectory: TrajectoryPoint[];
}

const MAX_HISTORY = 200;
const SCAN_INTERVAL = 2000;

export function useSerial() {
  const [state, setState] = useState<SerialState>({
    ports: [],
    connected: false,
    currentPort: "",
    devices: [],
    activeDeviceId: "",
    attitude: null,
    rawImu: null,
    attitudeHistory: [],
    rawHistory: [],
    fps: 0,
    error: null,
    trajectory: [],
  });

  const parserRef = useRef(new FrameParser());
  const trajRef = useRef(new TrajectoryEstimator(500));
  const lastAttitudeRef = useRef<AttitudeData | null>(null);
  const portRef = useRef<SerialPort | null>(null);
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const connectedRef = useRef(false);
  const rafRef = useRef<number>(0);

  // ── Data buffer (written by serial callback, read by RAF) ──
  const latestAttRef = useRef<AttitudeData | null>(null);
  const latestRawRef = useRef<RawImuData | null>(null);
  const attHistBufRef = useRef<AttitudeData[]>([]);
  const rawHistBufRef = useRef<RawImuData[]>([]);
  const dirtyRef = useRef(false);

  // Process incoming bytes: parse frames, update refs (no setState!)
  const processBytes = useCallback((bytes: Uint8Array) => {
    const results = parserRef.current.feed(bytes);
    for (const result of results) {
      frameCountRef.current++;
      if (result.type === "attitude") {
        lastAttitudeRef.current = result.data;
        latestAttRef.current = result.data;
        attHistBufRef.current.push(result.data);
        if (attHistBufRef.current.length > MAX_HISTORY) {
          attHistBufRef.current = attHistBufRef.current.slice(-MAX_HISTORY);
        }
      } else {
        latestRawRef.current = result.data;
        rawHistBufRef.current.push(result.data);
        if (rawHistBufRef.current.length > MAX_HISTORY) {
          rawHistBufRef.current = rawHistBufRef.current.slice(-MAX_HISTORY);
        }
        // Trajectory
        const att = lastAttitudeRef.current;
        if (att) {
          trajRef.current.update(
            att.q0, att.q1, att.q2, att.q3,
            result.data.ax, result.data.ay, result.data.az,
            result.data.timestamp,
          );
        }
      }
      dirtyRef.current = true;
    }
  }, []);

  // RAF loop: sync refs → state at ~60fps
  const startRafLoop = useCallback(() => {
    const tick = () => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        setState((s) => ({
          ...s,
          attitude: latestAttRef.current,
          rawImu: latestRawRef.current,
          attitudeHistory: [...attHistBufRef.current],
          rawHistory: [...rawHistBufRef.current],
          trajectory: [...trajRef.current.getPoints()],
        }));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopRafLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const scanPorts = useCallback(async () => {
    try {
      const portsMap = await SerialPort.available_ports();
      const ports: PortEntry[] = Object.entries(portsMap)
        .filter(([path, info]) => {
          if (/\/dev\/ttyS\d+$/.test(path)) return false;
          if (path.startsWith("COM") || /ttyACM|ttyUSB|cu\.|tty\.usb/i.test(path)) return true;
          if (info.type !== "PCI" && info.vid !== "Unknown") return true;
          return false;
        })
        .map(([path, info]) => ({
          path,
          manufacturer: info.manufacturer !== "Unknown" ? info.manufacturer : undefined,
        }));
      setState((s) => ({ ...s, ports }));
    } catch (e) {
      console.error("Scan failed:", e);
    }
  }, []);

  useEffect(() => {
    scanPorts();
    const id = setInterval(() => {
      if (!connectedRef.current) scanPorts();
    }, SCAN_INTERVAL);
    return () => clearInterval(id);
  }, [scanPorts]);

  const connect = useCallback(async (path: string, baudRate = 115200) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const port = new SerialPort({ path, baudRate });
      await port.open();

      parserRef.current.reset();
      frameCountRef.current = 0;
      attHistBufRef.current = [];
      rawHistBufRef.current = [];
      latestAttRef.current = null;
      latestRawRef.current = null;

      // FPS counter (1Hz)
      fpsIntervalRef.current = setInterval(() => {
        setState((s) => ({ ...s, fps: frameCountRef.current }));
        frameCountRef.current = 0;
      }, 1000);

      // Start RAF loop for UI sync
      startRafLoop();

      // Listen for serial data
      await port.listen((rawData: any) => {
        try {
          let bytes: Uint8Array;
          if (rawData instanceof Uint8Array) {
            bytes = rawData;
          } else if (rawData?.data) {
            bytes = new Uint8Array(rawData.data);
          } else if (typeof rawData === 'string') {
            bytes = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; i++) {
              bytes[i] = rawData.charCodeAt(i) & 0xFF;
            }
          } else {
            return;
          }
          processBytes(bytes);
        } catch (e) {
          console.error("[serial] process error:", e);
        }
      }, false);

      await port.startListening();

      portRef.current = port;
      connectedRef.current = true;
      const shortName = path.split("/").pop() || path;
      const deviceId = `dev_${Date.now()}`;
      const device: DeviceInfo = { id: deviceId, port: path, name: shortName };
      setState((s) => ({
        ...s,
        connected: true,
        currentPort: path,
        devices: [...s.devices.filter((d) => d.port !== path), device],
        activeDeviceId: deviceId,
      }));
    } catch (e: any) {
      const msg = e?.message || e?.toString() || "Connection failed";
      console.error("Connect failed:", e);
      setState((s) => ({ ...s, error: msg }));
    }
  }, [processBytes, startRafLoop]);

  const disconnect = useCallback(async () => {
    try {
      stopRafLoop();
      if (fpsIntervalRef.current) {
        clearInterval(fpsIntervalRef.current);
        fpsIntervalRef.current = null;
      }
      if (portRef.current) {
        await portRef.current.stopListening();
        await portRef.current.close();
        portRef.current = null;
      }
    } catch (e) {
      console.error("Disconnect error:", e);
    }
    connectedRef.current = false;
    trajRef.current.reset();
    lastAttitudeRef.current = null;
    setState((s) => ({
      ...s,
      connected: false,
      trajectory: [],
      currentPort: "",
      activeDeviceId: "",
      fps: 0,
      error: null,
    }));
  }, [stopRafLoop]);

  return { ...state, scanPorts, connect, disconnect };
}
