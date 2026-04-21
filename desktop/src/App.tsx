import { useState, useRef } from "react";
import Attitude3D from "./components/Attitude3D";
import DataPanel from "./components/DataPanel";
import WaveChart from "./components/WaveChart";
import SerialPort from "./components/SerialPort";
import { useSerial } from "./hooks/useSerial";
import { t, type Lang } from "./i18n";
import "./App.css";

function App() {
  const serial = useSerial();
  const [lang, setLang] = useState<Lang>("zh");
  const [zoom, setZoom] = useState(100);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const m = t(lang);

  const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // 释放旧的 blob url
    if (modelUrl) URL.revokeObjectURL(modelUrl);
    const url = URL.createObjectURL(file);
    setModelUrl(url);
  };

  const resetModel = () => {
    if (modelUrl) URL.revokeObjectURL(modelUrl);
    setModelUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ zoom: `${zoom}%` }}>
      {/* ── Sidebar ── */}
      <nav className="flex flex-col bg-surface-container-low w-56 h-full py-5 px-4 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-2 mb-4">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-headline font-bold text-xs">
            M
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-headline text-on-surface font-bold text-[15px] leading-tight">{m.brand}</div>
            <div className="text-on-surface-variant text-[12px]">{m.subtitle}</div>
          </div>
          <button
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
            className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] font-medium text-on-surface-variant hover:bg-surface-container-highest transition-colors shrink-0"
          >
            {lang === "zh" ? "EN" : "中"}
          </button>
        </div>

        {/* Serial Connection */}
        <SerialPort
          ports={serial.ports}
          connected={serial.connected}
          currentPort={serial.currentPort}
          onConnect={serial.connect}
          onDisconnect={serial.disconnect}
          error={serial.error}
          lang={m}
        />

        {/* Device List */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-2 mb-2">
            {m.devices}
          </div>
          {serial.devices.length === 0 ? (
            <div className="text-[11px] text-on-surface-variant px-2">{m.noDevice}</div>
          ) : (
            <div className="flex flex-col gap-1">
              {serial.devices.map((dev) => (
                <div
                  key={dev.id}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] transition-colors ${
                    dev.id === serial.activeDeviceId
                      ? "bg-surface-container-highest/60 text-on-surface font-medium"
                      : "text-on-surface-variant hover:bg-surface-container-highest/30"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    serial.connected && dev.id === serial.activeDeviceId ? "bg-green-500" : "bg-outline-variant"
                  }`} />
                  <span className="truncate">{dev.name}</span>
                  <span className="text-[10px] text-on-surface-variant ml-auto shrink-0">{dev.port.split("/").pop()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Model Upload */}
        <div className="mt-4">
          <div className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider px-2 mb-2">
            3D Model
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 py-1.5 rounded-md bg-surface-container-high text-on-surface text-[11px] font-medium hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1"
            >
              <span className="icon !text-[14px]">upload_file</span>
              {m.uploadModel}
            </button>
            {modelUrl && (
              <button
                onClick={resetModel}
                className="px-2 py-1.5 rounded-md bg-surface-container-high text-on-surface-variant text-[11px] hover:bg-surface-container-highest transition-colors"
              >
                {m.resetModel}
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".glb,.gltf"
            className="hidden"
            onChange={handleModelUpload}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/15">
          <div className="flex items-center justify-between px-2 text-[12px] text-on-surface-variant">
            <span className="icon !text-[14px]">zoom_in</span>
            <select
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="bg-surface-container-high border-none rounded py-0.5 px-1.5 text-[11px] text-on-surface font-mono focus:outline-none appearance-none cursor-pointer"
            >
              <option value={75}>75%</option>
              <option value={100}>100%</option>
              <option value={125}>125%</option>
              <option value={150}>150%</option>
              <option value={200}>200%</option>
            </select>
          </div>
          <div className="flex items-center justify-between px-2 text-[12px] text-on-surface-variant">
            <span>{m.fps}</span>
            <span className="font-mono font-medium text-on-surface">{serial.fps}</span>
          </div>
        </div>
      </nav>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 bg-surface-container-low bg-grid-pattern relative">
              <Attitude3D attitude={serial.attitude} modelUrl={modelUrl} />
              {serial.attitude && (
                <div className="absolute top-3 right-3 glass rounded-md px-3 py-1.5 flex gap-3 text-[11px] font-mono font-medium ambient-shadow-sm">
                  <span className="text-roll">R {serial.attitude.roll.toFixed(1)}°</span>
                  <span className="text-pitch">P {serial.attitude.pitch.toFixed(1)}°</span>
                  <span className="text-yaw">Y {serial.attitude.yaw.toFixed(1)}°</span>
                </div>
              )}
            </div>
            <div className="h-48 shrink-0 bg-surface border-t border-outline-variant/10 px-5 py-3">
              <WaveChart history={serial.attitudeHistory} lang={m} />
            </div>
          </div>

          <aside className="w-60 bg-surface-container-low h-full overflow-y-auto no-scrollbar shrink-0">
            <div className="px-4 py-4 sticky top-0 bg-surface-container-low z-10">
              <h2 className="font-headline text-[14px] font-bold text-on-surface">{m.data}</h2>
            </div>
            <div className="px-4 pb-5">
              <DataPanel attitude={serial.attitude} fps={serial.fps} connected={serial.connected} lang={m} />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
