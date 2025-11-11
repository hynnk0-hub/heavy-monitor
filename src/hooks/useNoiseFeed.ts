// src/data/useNoiseFeed.ts
import { useEffect, useRef, useState } from "react";

export type NoisePoint = { ts: number; t: string; n: number };

function clock() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// 초기 시드(대략 60~75dB 영역)
function seedNoise(count = 20, intervalMs = 5000): NoisePoint[] {
  const now = Date.now();
  const arr: NoisePoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const ts = now - i * intervalMs;
    const idx = count - 1 - i;
    // const n = 65 + Math.sin(idx / 2) * 5 + Math.random() * 2;
    const n = 100 + Math.sin(idx / 2) * 8 + Math.random() * 4;
    arr.push({ ts, t: clock(), n });
  }
  return arr;
}

type Options = {
  intervalMs?: number;
  maxPoints?: number;
};

export function useNoiseFeed({ intervalMs = 5000, maxPoints = 20 }: Options = {}) {
  const [data, setData] = useState<NoisePoint[]>(() => seedNoise(maxPoints, intervalMs));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const len = data.length;
        // const n = 65 + Math.sin(len / 2) * 5 + Math.random() * 2; // ~60~75dB
        const n = 100 + Math.sin(len / 2) * 8 + Math.random() * 4; // ~88~112dB

      const next: NoisePoint = { ts: Date.now(), t: clock(), n };
      setData((prev) => {
        const arr = [...prev, next];
        if (arr.length > maxPoints) arr.shift();
        return arr;
      });
    };

    timerRef.current = setInterval(tick, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalMs, maxPoints]);

  return data;
}
