import { useState } from "react";
import Attitude3D from "./components/Attitude3D";
import DataPanel from "./components/DataPanel";
import WaveChart from "./components/WaveChart";
import SerialPort from "./components/SerialPort";
import { useSerial } from "./hooks/useSerial";
import "./App.css";

type NavItem = "viewer" | "waves";

function App() {
  const serial = useSerial();
  const [activeNav, setActiveNav] = useState<NavItem>("viewer");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left Sidebar ── */}
      <nav className="hidden md:flex flex-col bg-surface-container-low w-60 h-full py-6 px-4 gap-y-2 shrink-0 relative z-20">
        {/* Brand */}
        <div className="mb-8 px-2 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center font-headline font-black text-base">
            H7
          </div>
          <div>
            <h1 className="font-headline text-on-surface font-bold text-sm leading-tight tracking-tight">
              DM-H7 Monitor
            </h1>
            <p className="font-body text-on-surface-variant text-xs">
              Attitude Visualizer
            </p>
          </div>
        </div>

        {/* Connection CTA */}
        <SerialPort
          ports={serial.ports}
          connected={serial.connected}
          currentPort={serial.currentPort}
          onScan={serial.scanPorts}
          onConnect={serial.connect}
          onDisconnect={serial.disconnect}
        />

        {/* Nav Links */}
        <div className="flex flex-col gap-1 mt-4 flex-grow">
          <button
            onClick={() => setActiveNav("viewer")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all duration-200 ${
              activeNav === "viewer"
                ? "text-on-surface font-bold bg-surface-container-highest/50"
                : "text-on-surface-variant hover:bg-surface-container-highest/30"
            }`}
          >
            <span className={`icon text-xl ${activeNav === "viewer" ? "icon-filled" : ""}`}>
              view_in_ar
            </span>
            <span className="font-body text-sm">3D Viewer</span>
          </button>
          <button
            onClick={() => setActiveNav("waves")}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all duration-200 ${
              activeNav === "waves"
                ? "text-on-surface font-bold bg-surface-container-highest/50"
                : "text-on-surface-variant hover:bg-surface-container-highest/30"
            }`}
          >
            <span className={`icon text-xl ${activeNav === "waves" ? "icon-filled" : ""}`}>
              show_chart
            </span>
            <span className="font-body text-sm">Waveform</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-1 mt-auto pt-4">
          <div className="flex items-center gap-3 px-3 py-2 text-on-surface-variant">
            <span className="icon text-xl">speed</span>
            <span className="font-body text-sm">{serial.fps} FPS</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <span className={`w-2 h-2 rounded-full ${serial.connected ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-surface-container-highest"}`} />
            <span className="font-body text-xs text-on-surface-variant">
              {serial.connected ? serial.currentPort : "Disconnected"}
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 relative h-full overflow-hidden">
        {/* Top Bar */}
        <header className="glass w-full sticky top-0 z-50 h-14 flex justify-between items-center px-8 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-8 h-full">
            <div className="text-sm font-bold tracking-tight text-on-surface font-headline uppercase">
              Attitude Monitor
            </div>
          </div>
          <div className="flex items-center gap-2">
            {serial.attitude && (
              <div className="flex items-center gap-4 mr-4">
                <span className="font-mono text-xs text-roll font-medium">
                  R {serial.attitude.roll.toFixed(1)}°
                </span>
                <span className="font-mono text-xs text-pitch font-medium">
                  P {serial.attitude.pitch.toFixed(1)}°
                </span>
                <span className="font-mono text-xs text-yaw font-medium">
                  Y {serial.attitude.yaw.toFixed(1)}°
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden relative">
          {/* 3D Viewport / Waveform (Center) */}
          <div className="flex-1 relative overflow-hidden">
            {activeNav === "viewer" ? (
              <div className="w-full h-full bg-surface-container-low bg-grid-pattern">
                <Attitude3D attitude={serial.attitude} />
                {/* Floating toolbar */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 glass rounded-full px-5 py-2.5 flex items-center gap-5 ambient-shadow border border-outline-variant/15">
                  <button className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="icon text-lg">visibility</span>
                    <span className="text-[9px] font-body font-medium uppercase tracking-wider">Top</span>
                  </button>
                  <div className="w-px h-5 bg-outline-variant/30" />
                  <button className="flex flex-col items-center gap-0.5 text-primary transition-colors">
                    <span className="icon text-lg bg-primary-fixed-dim/20 rounded-full p-0.5">view_in_ar</span>
                    <span className="text-[9px] font-body font-medium uppercase tracking-wider">Front</span>
                  </button>
                  <div className="w-px h-5 bg-outline-variant/30" />
                  <button className="flex flex-col items-center gap-0.5 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="icon text-lg">3d_rotation</span>
                    <span className="text-[9px] font-body font-medium uppercase tracking-wider">Side</span>
                  </button>
                </div>
                {/* Floating gizmos */}
                <div className="absolute top-5 left-5 flex flex-col gap-2">
                  <button className="w-9 h-9 glass rounded-full flex items-center justify-center text-on-surface ambient-shadow-sm border border-outline-variant/15 hover:text-primary transition-colors">
                    <span className="icon text-sm">open_with</span>
                  </button>
                  <button className="w-9 h-9 glass rounded-full flex items-center justify-center text-on-surface ambient-shadow-sm border border-outline-variant/15 hover:text-primary transition-colors">
                    <span className="icon text-sm">zoom_in</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full bg-surface p-8 overflow-y-auto">
                <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight mb-6">
                  Waveform Analysis
                </h2>
                <WaveChart history={serial.attitudeHistory} />
              </div>
            )}
          </div>

          {/* Right Properties Panel */}
          <aside className="w-72 bg-surface-container-low h-full flex flex-col overflow-y-auto no-scrollbar shadow-[-12px_0_32px_rgba(26,28,28,0.03)] z-10 shrink-0">
            <div className="px-5 py-4 sticky top-0 bg-surface-container-low z-10 flex justify-between items-center">
              <h2 className="font-headline text-base font-bold text-on-surface tracking-tight">
                Properties
              </h2>
              <button className="text-on-surface-variant hover:bg-surface-container-highest p-1 rounded-full transition-colors">
                <span className="icon text-lg">more_vert</span>
              </button>
            </div>
            <div className="px-5 pb-6">
              <DataPanel
                attitude={serial.attitude}
                fps={serial.fps}
                connected={serial.connected}
              />
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}

export default App;
