// src/components/TrendLineCard.jsx
import CardShell from "./CardShell";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { useMemo } from "react";

export function TrendLineCard({
  title,
  data,
  yKey,
  color = "#1e88e5",
  height = "290px",
  lineWidth = 2,
  yMin,
  yMax,
  // 영역 채우기 기준선: "zero"(기본, y=0), "yMin"(yMin부터 채움), "dataMin", 숫자
  base = "zero",
  isAnimationActive = false,
  seriesName,
}) {
  const gradId = useMemo(() => `grad-${Math.random().toString(36).slice(2, 9)}`, []);

  const hasTs =
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[data.length - 1]?.ts === "number";

  // ts가 있으면 최근 구간만 보이도록 domain 계산(슬라이딩)
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
    const windowSize = avgDelta * Math.max(20, data.length);
    domainMax = lastTs;
    domainMin = lastTs - windowSize;
  }

  const baseValue =
    base === "yMin"
      ? (typeof yMin === "number" ? yMin : "dataMin")
      : base === "dataMin"
      ? "dataMin"
      : typeof base === "number"
      ? base
      : 0; // "zero"

  return (
    <CardShell title={title}>
      <div style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 25, right: 20, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                <stop offset="95%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            </defs>

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
              domain={
                typeof yMin === "number" && typeof yMax === "number"
                  ? [yMin, yMax]
                  : ["auto", "auto"]
              }
              label={{
                    value: "소음 dB(A)",
                    position: "insideTopLeft",
                    angle: 0,                 
                    dy: -25,                    
                    style: { fontSize: 12, fill: "#666" },
                }}
            />

            <Tooltip
              labelFormatter={(label) => (hasTs ? new Date(label).toLocaleTimeString() : label)}
              formatter={(value, name) => [ typeof value === "number" ? `${value.toFixed(2)} dB(A)` : value, name]}
            />

            <Area
              type="monotone"
              dataKey={yKey}
              stroke={color}
              strokeWidth={lineWidth}
              fill={`url(#${gradId})`}
              fillOpacity={1}
              baseValue={baseValue}
              connectNulls
              dot={true}
              isAnimationActive={isAnimationActive}
              name={seriesName || yKey}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
}
