import CardShell from "./CardShell";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export function RpmPmCard({ title="RPM & 매연 트렌드 차트", data, rpmKey="rpm", pmKey="pm", height="100%", lineWidth=3, leftMin, leftMax, rightMin, rightMax, leftLabel="RPM", rightLabel="PM (ppm)", }) {
  const hasTs = Array.isArray(data) && data.length > 0 && typeof data[data.length - 1]?.ts === "number";
  let domainMin, domainMax;
  if (hasTs) {
    const lastTs = data[data.length - 1].ts;
    const n = Math.min(10, data.length - 1);
    let avgDelta = 5000;
    if (n > 0) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const a = data[data.length - 1 - i].ts;
        const b = data[data.length - 2 - i].ts;
        sum += Math.max(1, a - b);
      }
      avgDelta = sum / n;
    }
    const windowSize = avgDelta * Math.max(30, data.length); // 최근 30포인트 기준
    domainMax = lastTs;
    domainMin = lastTs - windowSize;
  }  return (
    <CardShell title={title}>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top:25, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            {hasTs ? (
              <XAxis
                type="number"
                dataKey="ts"
                domain={[domainMin, domainMax]}
                allowDataOverflow
                tickFormatter={(v) => new Date(v).toLocaleTimeString()}
                minTickGap={20}
              />
            ) : (
              <XAxis dataKey="t" minTickGap={20} />
            )}
              <YAxis
                yAxisId="left"
                domain={[ leftMin ?? "auto", leftMax ?? "auto" ]}
                label={{ value: leftLabel, position: "insideTopRight", angle: 0, dy: -25, style: { fontSize: 12, fill: "#666" }}}
                />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[ rightMin ?? "auto", rightMax ?? "auto" ]}
                label={{ value: rightLabel, position: "insideTopRight", angle: 0, dy: -25, style: { fontSize: 12, fill: "#666" }}}
              />
            <Tooltip
              labelFormatter={(label) => (hasTs ? new Date(label).toLocaleTimeString() : label)}
              formatter={(value, name) => [ typeof value === "number" ? value.toFixed(2) : value, name]}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={rpmKey}
              name="RPM"
              stroke="#1976d2"
              strokeWidth={lineWidth}
              dot={true}
              isAnimationActive={false}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey={pmKey}
              name="매연 (ppm)"
              stroke="#8e24aa"
              strokeWidth={lineWidth}
              dot={true}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
}