// src/data/useVibFeed.ts
import { useEffect, useRef, useState } from "react";

export type VibPoint = { ts: number; t: string; x: number; y: number; z: number };

const initVib: VibPoint[] = [
  { ts: Date.now() - 40000, t: "16:30", x: 1.5, y: 1.2, z: 1.7 },
  { ts: Date.now(),         t: "17:10", x: 1.25, y: 1.65, z: 1.7 },
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function randomWalk(prev: number, step = 0.12, min = 0.8, max = 2.2) {
  return clamp(prev + (Math.random() * 2 - 1) * step, min, max);
}

function clock() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`; // 초까지
}

type Options = {
  intervalMs?: number;
  maxPoints?: number;
  seed?: VibPoint[]; // 초기 시드 교체 가능
};

export function useVibFeed({
  intervalMs = 5000,
  maxPoints = 20,
  seed = initVib,
}: Options = {}) {
  const [data, setData] = useState<VibPoint[]>(seed);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const last = data[data.length - 1] ?? { x: 1.3, y: 1.5, z: 1.6, ts: Date.now() - intervalMs };
      const next: VibPoint = {
        ts: Date.now(),
        t: clock(),
        x: randomWalk(last.x),
        y: randomWalk(last.y),
        z: randomWalk(last.z),
      };
      setData((prev) => {
        const arr = [...prev, next];
        if (arr.length > maxPoints) arr.shift();
        return arr;
      });
    };

    timerRef.current = setInterval(tick, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    };
  }, [intervalMs, maxPoints]); // seed는 mount에서만 반영
  return data;
}
