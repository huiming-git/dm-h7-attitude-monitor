import { useState, useRef, useCallback, useEffect } from "react";
import { SerialPort } from "tauri-plugin-serialplugin";
import { FrameParser, type AttitudeData, type RawImuData } from "../protocol";

interface PortEntry {
  path: string;
  manufacturer?: string;
}

export interface SerialState {
  ports: PortEntry[];
  connected: boolean;
  currentPort: string;
  attitude: AttitudeData | null;
  rawImu: RawImuData | null;
  attitudeHistory: AttitudeData[];
  rawHistory: RawImuData[];
  fps: number;
  // 新设备发现弹窗
  pendingPort: PortEntry | null;
  error: string | null;
}

const MAX_HISTORY = 200;
const SCAN_INTERVAL = 2000; // 每 2 秒自动扫描

export function useSerial() {
  const [state, setState] = useState<SerialState>({
    ports: [],
    connected: false,
    currentPort: "",
    attitude: null,
    rawImu: null,
    attitudeHistory: [],
    rawHistory: [],
    fps: 0,
    pendingPort: null,
    error: null,
  });

  const parserRef = useRef(new FrameParser());
  const portRef = useRef<SerialPort | null>(null);
  const frameCountRef = useRef(0);
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownPortsRef = useRef<Set<string>>(new Set());
  const connectedRef = useRef(false);

  // 扫描端口
  const scanPorts = useCallback(async () => {
    try {
      const portsMap = await SerialPort.available_ports();
      const ports: PortEntry[] = Object.entries(portsMap).map(
        ([path, info]) => ({
          path,
          manufacturer: info.manufacturer !== "Unknown" ? info.manufacturer : undefined,
        })
      );
      setState((s) => ({ ...s, ports, error: null }));

      // 检测新设备
      if (!connectedRef.current) {
        for (const p of ports) {
          if (!knownPortsRef.current.has(p.path)) {
            // 发现新端口，弹窗提示
            setState((s) => ({ ...s, pendingPort: p }));
          }
        }
      }
      // 更新已知端口列表
      knownPortsRef.current = new Set(ports.map((p) => p.path));
    } catch (e) {
      console.error("Scan failed:", e);
    }
  }, []);

  // 自动定时扫描
  useEffect(() => {
    scanPorts();
    const id = setInterval(() => {
      if (!connectedRef.current) {
        scanPorts();
      }
    }, SCAN_INTERVAL);
    return () => clearInterval(id);
  }, [scanPorts]);

  // 关闭弹窗
  const dismissPending = useCallback(() => {
    setState((s) => ({ ...s, pendingPort: null }));
  }, []);

  // 连接
  const connect = useCallback(async (path: string, baudRate = 115200) => {
    setState((s) => ({ ...s, error: null, pendingPort: null }));
    try {
      const port = new SerialPort({ path, baudRate });
      await port.open();

      parserRef.current.reset();
      frameCountRef.current = 0;

      fpsIntervalRef.current = setInterval(() => {
        setState((s) => ({ ...s, fps: frameCountRef.current }));
        frameCountRef.current = 0;
      }, 1000);

      await port.listen((data: { data: number[] }) => {
        const bytes = new Uint8Array(data.data);
        const results = parserRef.current.feed(bytes);
        for (const result of results) {
          frameCountRef.current++;
          if (result.type === "attitude") {
            setState((s) => ({
              ...s,
              attitude: result.data,
              attitudeHistory: [
                ...s.attitudeHistory.slice(-MAX_HISTORY + 1),
                result.data,
              ],
            }));
          } else {
            setState((s) => ({
              ...s,
              rawImu: result.data,
              rawHistory: [
                ...s.rawHistory.slice(-MAX_HISTORY + 1),
                result.data,
              ],
            }));
          }
        }
      }, false);

      await port.startListening();

      portRef.current = port;
      connectedRef.current = true;
      setState((s) => ({ ...s, connected: true, currentPort: path }));
    } catch (e: any) {
      const msg = e?.message || e?.toString() || "Connection failed";
      console.error("Connect failed:", e);
      setState((s) => ({ ...s, error: msg }));
    }
  }, []);

  // 断开
  const disconnect = useCallback(async () => {
    try {
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
    setState((s) => ({
      ...s,
      connected: false,
      currentPort: "",
      fps: 0,
    }));
  }, []);

  return { ...state, scanPorts, connect, disconnect, dismissPending };
}
