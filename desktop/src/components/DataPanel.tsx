import type { AttitudeData } from "../protocol";

interface DataPanelProps {
  attitude: AttitudeData | null;
  fps: number;
  connected: boolean;
}

function fmt(n: number | undefined, d = 2): string {
  return n !== undefined ? n.toFixed(d) : "—";
}

function DataCard({ label, value, unit, color }: {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-lg p-3.5 ambient-shadow-sm flex flex-col gap-1">
      <span className="font-body text-xs font-medium text-on-surface-variant">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono text-xl font-semibold"
          style={{ color: color || "var(--color-on-surface)" }}
        >
          {value}
        </span>
        {unit && (
          <span className="font-body text-xs text-on-surface-variant">{unit}</span>
        )}
      </div>
    </div>
  );
}

export default function DataPanel({ attitude, fps, connected }: DataPanelProps) {
  return (
    <div className="flex flex-col gap-7">
      {/* Status */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Status
        </h3>
        <div className="bg-surface-container-lowest rounded-lg p-3.5 ambient-shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-surface-container-highest"}`} />
            <span className="font-body text-sm text-on-surface">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
          {connected && (
            <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">
              {fps} Hz
            </span>
          )}
        </div>
      </section>

      {/* Euler Angles */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Euler Angles
        </h3>
        <div className="flex flex-col gap-2">
          <DataCard label="Roll" value={fmt(attitude?.roll)} unit="°" color="var(--color-roll)" />
          <DataCard label="Pitch" value={fmt(attitude?.pitch)} unit="°" color="var(--color-pitch)" />
          <DataCard label="Yaw" value={fmt(attitude?.yaw)} unit="°" color="var(--color-yaw)" />
        </div>
      </section>

      {/* Quaternion */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Quaternion
        </h3>
        <div className="bg-surface-container-lowest rounded-lg p-3.5 ambient-shadow-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {(["q0", "q1", "q2", "q3"] as const).map((key) => (
              <div key={key} className="flex justify-between items-center">
                <span className="font-body text-xs text-on-surface-variant">{key}</span>
                <span className="font-mono text-sm font-medium text-on-surface">
                  {fmt(attitude?.[key], 4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Angular Velocity */}
      <section className="flex flex-col gap-3">
        <h3 className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
          Angular Velocity
        </h3>
        <div className="bg-surface-container-lowest rounded-lg p-3.5 ambient-shadow-sm">
          <div className="flex flex-col gap-2">
            {([
              ["Gx", attitude?.gx],
              ["Gy", attitude?.gy],
              ["Gz", attitude?.gz],
            ] as const).map(([label, val]) => (
              <div key={label} className="flex justify-between items-center">
                <span className="font-body text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="icon text-sm text-primary">speed</span>
                  {label}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-sm font-medium text-on-surface">
                    {fmt(val as number | undefined, 3)}
                  </span>
                  <span className="font-body text-[10px] text-on-surface-variant">rad/s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
