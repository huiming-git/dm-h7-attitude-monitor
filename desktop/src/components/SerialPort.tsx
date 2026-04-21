import { useState, useEffect } from "react";

interface SerialPortProps {
  ports: { path: string; manufacturer?: string }[];
  connected: boolean;
  currentPort: string;
  onScan: () => void;
  onConnect: (path: string, baudRate: number) => void;
  onDisconnect: () => void;
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export default function SerialPort({
  ports,
  connected,
  currentPort,
  onScan,
  onConnect,
  onDisconnect,
}: SerialPortProps) {
  const [selectedPort, setSelectedPort] = useState("");
  const [baudRate, setBaudRate] = useState(115200);

  useEffect(() => { onScan(); }, [onScan]);

  useEffect(() => {
    if (ports.length > 0 && !selectedPort) {
      setSelectedPort(ports[0].path);
    }
  }, [ports, selectedPort]);

  if (connected) {
    return (
      <button
        onClick={onDisconnect}
        className="w-full flex items-center justify-center gap-2 bg-surface-container-highest text-on-surface py-2.5 px-4 rounded font-body font-medium text-sm transition-colors hover:bg-surface-container-high"
      >
        <span className="icon text-sm">link_off</span>
        {currentPort}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Port select */}
      <div className="relative">
        <select
          value={selectedPort}
          onChange={(e) => setSelectedPort(e.target.value)}
          className="w-full bg-surface-container-high border-none rounded py-2 pl-3 pr-8 text-xs font-body text-on-surface focus:outline-none focus:ring-0 appearance-none cursor-pointer"
        >
          {ports.length === 0 && <option value="">No ports</option>}
          {ports.map((p) => (
            <option key={p.path} value={p.path}>
              {p.path}
            </option>
          ))}
        </select>
        <span className="icon text-sm absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
          expand_more
        </span>
      </div>

      {/* Baud + Scan row */}
      <div className="flex gap-1.5">
        <select
          value={baudRate}
          onChange={(e) => setBaudRate(Number(e.target.value))}
          className="flex-1 bg-surface-container-high border-none rounded py-1.5 pl-3 pr-6 text-xs font-body text-on-surface focus:outline-none focus:ring-0 appearance-none cursor-pointer"
        >
          {BAUD_RATES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button
          onClick={onScan}
          className="px-2.5 py-1.5 rounded bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest transition-colors"
          title="Scan"
        >
          <span className="icon text-sm">refresh</span>
        </button>
      </div>

      {/* Connect CTA */}
      <button
        onClick={() => onConnect(selectedPort, baudRate)}
        disabled={!selectedPort}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-primary to-primary-container text-on-primary py-2.5 px-4 rounded font-body font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        <span className="icon text-sm">link</span>
        Connect
      </button>
    </div>
  );
}
