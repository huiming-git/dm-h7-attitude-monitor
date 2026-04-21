import type { AttitudeData } from "../protocol";
import type { Messages } from "../i18n";

function fmt(n: number | undefined, d = 2): string {
  return n !== undefined ? n.toFixed(d) : "—";
}

export function EulerPanel({ attitude, lang }: { attitude: AttitudeData | null; lang: Messages }) {
  return (
    <div className="p-3 h-full flex flex-col justify-center gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-on-surface-variant">{lang.roll}</span>
        <span className="font-mono text-[14px] font-medium text-roll">{fmt(attitude?.roll)}°</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-on-surface-variant">{lang.pitch}</span>
        <span className="font-mono text-[14px] font-medium text-pitch">{fmt(attitude?.pitch)}°</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[12px] text-on-surface-variant">{lang.yaw}</span>
        <span className="font-mono text-[14px] font-medium text-yaw">{fmt(attitude?.yaw)}°</span>
      </div>
    </div>
  );
}

export function QuaternionPanel({ attitude }: { attitude: AttitudeData | null }) {
  return (
    <div className="p-3 h-full flex flex-col justify-center gap-2">
      {(["q0", "q1", "q2", "q3"] as const).map((key) => (
        <div key={key} className="flex justify-between">
          <span className="text-[12px] text-on-surface-variant">{key}</span>
          <span className="font-mono text-[13px] font-medium text-on-surface">{fmt(attitude?.[key], 4)}</span>
        </div>
      ))}
    </div>
  );
}

export function AngularVelocityPanel({ attitude }: { attitude: AttitudeData | null }) {
  const items = [
    ["Gx", attitude?.gx],
    ["Gy", attitude?.gy],
    ["Gz", attitude?.gz],
  ] as const;

  return (
    <div className="p-3 h-full flex flex-col justify-center gap-3">
      {items.map(([label, val]) => (
        <div key={label} className="flex items-center justify-between">
          <span className="text-[12px] text-on-surface-variant">{label}</span>
          <span className="font-mono text-[13px] font-medium text-on-surface">
            {fmt(val as number | undefined, 3)} <span className="text-on-surface-variant text-[10px]">rad/s</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// 保留旧的 default export 用于兼容
interface DataPanelProps {
  attitude: AttitudeData | null;
  fps: number;
  connected: boolean;
  lang: Messages;
}

export default function DataPanel({ attitude, lang }: DataPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{lang.eulerAngles}</h3>
        <div className="bg-surface-container-lowest rounded-md ambient-shadow-sm">
          <EulerPanel attitude={attitude} lang={lang} />
        </div>
      </section>
      <section>
        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{lang.quaternion}</h3>
        <div className="bg-surface-container-lowest rounded-md ambient-shadow-sm">
          <QuaternionPanel attitude={attitude} />
        </div>
      </section>
      <section>
        <h3 className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{lang.angularVelocity}</h3>
        <div className="bg-surface-container-lowest rounded-md ambient-shadow-sm">
          <AngularVelocityPanel attitude={attitude} />
        </div>
      </section>
    </div>
  );
}
