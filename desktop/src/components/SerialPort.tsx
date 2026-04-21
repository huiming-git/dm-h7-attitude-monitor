interface SerialPortProps {
  ports: { path: string; manufacturer?: string }[];
  connected: boolean;
  currentPort: string;
  onDisconnect: () => void;
}

export default function SerialPort({
  ports,
  connected,
  currentPort,
  onDisconnect,
}: SerialPortProps) {
  if (connected) {
    return (
      <button
        onClick={onDisconnect}
        className="w-full flex items-center justify-center gap-1.5 bg-surface-container-highest text-on-surface py-1.5 px-3 rounded-md text-[12px] font-medium transition-colors hover:bg-surface-container-high"
      >
        <span className="icon !text-[14px]">link_off</span>
        <span className="truncate">{currentPort}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-on-surface-variant">
      <span className="icon !text-[14px] animate-spin" style={{ animationDuration: "2s" }}>refresh</span>
      <span>Scanning... ({ports.length} ports)</span>
    </div>
  );
}
