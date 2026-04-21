import { useState, useEffect } from "react";

interface SerialPortProps {
  ports: { path: string; manufacturer?: string }[];
  connected: boolean;
  currentPort: string;
  onConnect: (path: string, baudRate: number) => void;
  onDisconnect: () => void;
  error: string | null;
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export default function SerialPort({
  ports,
  connected,
  currentPort,
  onConnect,
  onDisconnect,
  error,
}: SerialPortProps) {
  const [selectedPort, setSelectedPort] = useState("");
  const [baudRate, setBaudRate] = useState(115200);

  // 自动选中第一个端口
  useEffect(() => {
    if (ports.length > 0 && (!selectedPort || !ports.find((p) => p.path === selectedPort))) {
      setSelectedPort(ports[0].path);
    }
  }, [ports, selectedPort]);

  if (connected) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 px-2 py-1 text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-on-surface truncate font-medium">{currentPort}</span>
        </div>
        <button
          onClick={onDisconnect}
          className="w-full py-1.5 rounded-md bg-surface-container-highest text-on-surface text-[11px] font-medium hover:bg-surface-container-high transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* Port select */}
      <select
        value={selectedPort}
        onChange={(e) => setSelectedPort(e.target.value)}
        className="w-full bg-surface-container-high border-none rounded-md py-1.5 px-2 text-[11px] text-on-surface focus:outline-none appearance-none cursor-pointer truncate"
      >
        {ports.length === 0 && <option value="">No ports found</option>}
        {ports.map((p) => (
          <option key={p.path} value={p.path}>{p.path}</option>
        ))}
      </select>

      {/* Baud rate */}
      <select
        value={baudRate}
        onChange={(e) => setBaudRate(Number(e.target.value))}
        className="w-full bg-surface-container-high border-none rounded-md py-1.5 px-2 text-[11px] text-on-surface focus:outline-none appearance-none cursor-pointer"
      >
        {BAUD_RATES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Connect button */}
      <button
        onClick={() => onConnect(selectedPort, baudRate)}
        disabled={!selectedPort}
        className="w-full py-1.5 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary text-[11px] font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        Connect
      </button>

      {/* Error */}
      {error && (
        <div className="text-[10px] text-red-600 px-1">{error}</div>
      )}
    </div>
  );
}
