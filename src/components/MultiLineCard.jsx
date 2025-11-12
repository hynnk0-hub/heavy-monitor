// src/components/MultiLineCard.jsx
import CardShell from "./CardShell";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine
} from "recharts";

/**
 * 여러 개의 선을 하나의 Y축으로 그리는 카드
 * @param {string} title - 카드 타이틀
 * @param {Array<object>} data - [{ t: "16:30", x: 1.2, y: 1.3, z: 1.5 }, ...]
 * @param {Array<{key:string, name?:string, color?:string, type?:string}>} series
 *        - 그릴 시리즈 목록 (예: [{key:'x', name:'X', color:'#1e88e5'}, ...])
 * @param {string|number} height - 차트 높이 (기본 "100%")
 */

const VIB_MIN = 1.3;
const VIB_MAX = 2.0;

export function MultiLineCard({
  title = "멀티 라인 차트",
  data = [],
  series = [],
  height = "100%",
  lineWidth = 3,
  yMin,
  yMax,
  seriesName,
}) {
// ts(숫자 타임스탬프)가 있으면 시간 축으로 슬라이딩 윈도우 구현
  const hasTs = Array.isArray(data) && data.length > 0 && typeof data[data.length - 1]?.ts === "number";
  let domainMin = undefined;
  let domainMax = undefined;
  if (hasTs) {
    const lastTs = data[data.length - 1].ts;
    // 윈도우 크기: 데이터 간 간격의 평균 × (표시하고 싶은 포인트 수)
    const n = Math.min(10, data.length - 1);
    let avgDelta = 5000; // 기본 10000ms
    if (n > 0) {
      let sum = 0;
      for (let i = 0; i < n; i++) {
        const a = data[data.length - 1 - i].ts;
        const b = data[data.length - 2 - i].ts;
        sum += Math.max(1, a - b);
      }
      avgDelta = sum / n;
    }
    const windowSize = avgDelta * Math.max(20, data.length); // 최근 20개 기준 윈도우
    domainMax = lastTs;
    domainMin = lastTs - windowSize;
  }
  return (
    <CardShell title={title} fullHeight>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 25, right: 20, left: 0, bottom: 0 }}>
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
            <YAxis domain={
              typeof yMin === "number" && typeof yMax === "number"
                ? [yMin, yMax]
                : ["auto", "auto"]
              } 
              label={{
                    value: "가속도 (g)",
                    position: "insideTopLeft",
                    angle: 0,                 
                    dy: -25,                    
                    style: { fontSize: 12, fill: "#666" },
                }}
            />
            <Tooltip
              labelFormatter={(label) =>hasTs ? new Date(label).toLocaleTimeString() : label}
              formatter={(value, name) => [ typeof value === "number" ? `${value.toFixed(2)} g` : value, name]}
            />
            <ReferenceLine
              y={VIB_MIN}
              stroke="#FF0000"
              strokeDasharray="6 6"
              label={{ value: `LOW ${VIB_MIN}`, position: 'insideTopLeft', fontSize: '14px', fill: '#FF0000'}}
              />
            <ReferenceLine
              y={VIB_MAX}
              stroke="#FF0000"
              strokeDasharray="6 6"
              label={{ value: `LOW ${VIB_MAX}`, position: 'insideBottomLeft', fontSize: '14px', fill: '#FF0000'}}
            />
            <Legend />
            {series.map((s) => (
              <Line
                key={s.key}
                type={s.type || "monotone"}
                dataKey={s.key}
                name={`${s.name}축` || s.key}
                stroke={s.color}
                strokeWidth={lineWidth}
                dot={true}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardShell>
  );
}
