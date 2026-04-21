import { useState } from "react";

interface ConnectDialogProps {
  port: { path: string; manufacturer?: string };
  onConnect: (path: string, baudRate: number) => void;
  onDismiss: () => void;
  error: string | null;
}

const BAUD_RATES = [9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600];

export default function ConnectDialog({ port, onConnect, onDismiss, error }: ConnectDialogProps) {
  const [baudRate, setBaudRate] = useState(115200);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-lg w-80 ambient-shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 pt-5 pb-3">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="icon text-primary !text-[20px]">usb</span>
            <h3 className="font-headline text-[15px] font-bold text-on-surface">Device Detected</h3>
          </div>
          <p className="text-[12px] text-on-surface-variant mt-2">
            A new serial device has been found. Connect to it?
          </p>
        </div>

        {/* Port info */}
        <div className="mx-5 bg-surface-container rounded-md p-3 flex flex-col gap-1.5">
          <div className="flex justify-between text-[11px]">
            <span className="text-on-surface-variant">Port</span>
            <span className="font-mono font-medium text-on-surface">{port.path}</span>
          </div>
          {port.manufacturer && (
            <div className="flex justify-between text-[11px]">
              <span className="text-on-surface-variant">Manufacturer</span>
              <span className="font-medium text-on-surface">{port.manufacturer}</span>
            </div>
          )}
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-on-surface-variant">Baud Rate</span>
            <select
              value={baudRate}
              onChange={(e) => setBaudRate(Number(e.target.value))}
              className="bg-surface-container-high border-none rounded py-0.5 px-1.5 text-[11px] text-on-surface focus:outline-none appearance-none cursor-pointer font-mono"
            >
              {BAUD_RATES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-2 bg-red-50 text-red-700 text-[11px] px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-5 py-4">
          <button
            onClick={onDismiss}
            className="flex-1 py-2 rounded-md bg-surface-container-high text-on-surface text-[12px] font-medium hover:bg-surface-container-highest transition-colors"
          >
            Ignore
          </button>
          <button
            onClick={() => onConnect(port.path, baudRate)}
            className="flex-1 py-2 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary text-[12px] font-medium hover:opacity-90 transition-opacity"
          >
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
