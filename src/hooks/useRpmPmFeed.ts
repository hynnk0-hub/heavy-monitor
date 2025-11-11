// src/data/useRpmPmFeed.ts
import { useEffect, useRef, useState } from "react";

export type RpmPmPoint = { ts: number; t: string; rpm: number; pm: number };

function clock() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

function seedRpmPm(count = 30, intervalMs = 5000): RpmPmPoint[] {
  const now = Date.now();
  const arr: RpmPmPoint[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const ts = now - i * intervalMs;
    const idx = count - 1 - i;
    const rpm = 500 + Math.sin(idx / 2) * 400 + Math.random() * 50;   // ~100~950
    const pm  = 12  + Math.sin(idx / 2) * 6   + Math.random() * 1.5;  // ~3~21
    arr.push({ ts, t: clock(), rpm, pm });
  }
  return arr;
}

type Options = { intervalMs?: number; maxPoints?: number };

export function useRpmPmFeed({ intervalMs = 5000, maxPoints = 30 }: Options = {}) {
  const [data, setData] = useState<RpmPmPoint[]>(() => seedRpmPm(maxPoints, intervalMs));
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const tick = () => {
      const len = data.length;
      const rpm = 500 + Math.sin(len / 2) * 400 + Math.random() * 50;
      const pm  = 12  + Math.sin(len / 2) * 6   + Math.random() * 1.5;

      const next: RpmPmPoint = { ts: Date.now(), t: clock(), rpm, pm };
      setData(prev => {
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
