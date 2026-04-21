import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AttitudeData } from "../protocol";

interface WaveChartProps {
  history: AttitudeData[];
}

export default function WaveChart({ history }: WaveChartProps) {
  const data = history.map((d, i) => ({
    idx: i,
    roll: parseFloat(d.roll.toFixed(2)),
    pitch: parseFloat(d.pitch.toFixed(2)),
    yaw: parseFloat(d.yaw.toFixed(2)),
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* Euler Angles Chart */}
      <div className="bg-surface-container-lowest rounded-lg p-5 ambient-shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-headline text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
            Euler Angles
          </h3>
          <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-1 rounded">
            {history.length} pts
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="idx" hide />
            <YAxis
              domain={[-180, 180]}
              stroke="#c1c6d7"
              fontSize={11}
              fontFamily="Inter"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend
              iconType="circle"
              iconSize={6}
              wrapperStyle={{ paddingTop: 8 }}
            />
            <Line
              type="monotone"
              dataKey="roll"
              stroke="#e53935"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name="Roll"
            />
            <Line
              type="monotone"
              dataKey="pitch"
              stroke="#43a047"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name="Pitch"
            />
            <Line
              type="monotone"
              dataKey="yaw"
              stroke="#1e88e5"
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
              name="Yaw"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
