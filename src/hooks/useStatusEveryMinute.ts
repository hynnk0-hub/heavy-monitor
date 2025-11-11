// src/hooks/useStatusEveryMinute.ts
import { useEffect, useMemo, useRef, useState } from "react";

type VibMag = { ts: number; t: string; v: number };
type NoisePt = { ts: number; t: string; n: number };
type RpmPmPt = { ts: number; t: string; rpm: number; pm: number };

type Hot = { engine: number; hydraulic: number };
type Status = {
  hot: Hot;
  vibration: number; // m/s²
  noise: number;     // dB
  rpm: number;
  pm: number;        // ppm (또는 단위에 맞게)
};

type Options = {
  /** 집계 방식: "latest"(최근 샘플) | "avg"(최근 windowMs 평균) */
  mode?: "latest" | "avg";
  /** 온도 seed (실시간 소스 붙일 때 대체 예정) */
  hotSeed?: Hot;                     // 기본 { engine: 42, hydraulic: 38 }
  /** 평균 모드에서 사용할 시간 윈도우(ms) */
  windowMs?: number;                 // 기본 60_000 (최근 60초 평균)
  /** 평균 모드에서 최소 표본 개수 */
  minSamplesForAvg?: number;         // 기본 3
  /** 상태 갱신 주기(ms) — 0.5초마다 갱신하려면 500 */
  tickMs?: number;                   // 기본 500
};

export function useStatusEveryMinute(
  vibMag: VibMag[],
  noiseTrend: NoisePt[],
  rpmPmTrend: RpmPmPt[],
  {
    mode = "latest",
    hotSeed = { engine: 42, hydraulic: 38 },
    windowMs = 60_000,
    minSamplesForAvg = 3,
    tickMs = 500,
  }: Options = {}
) {
  const [status, setStatus] = useState<Status>({
    hot: hotSeed,
    vibration: 0,
    noise: 0,
    rpm: 0,
    pm: 0,
  });

  // 헬퍼
  const round2 = (x: number) => Math.round(x * 100) / 100;
  const round0 = (x: number) => Math.round(x);

  const nowRef = useRef<number>(Date.now());

  const pickLatest = <T,>(arr: T[]) => (arr?.length ? arr[arr.length - 1] : undefined);

  const averageWindow = <T extends { ts: number }>(
    arr: T[],
    key: keyof T,
    window: number
  ) => {
    const cutoff = nowRef.current - window;
    const win = arr.filter((p) => p.ts >= cutoff);
    if (win.length === 0) return undefined;
    const sum = win.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
    return { mean: sum / win.length, count: win.length };
  };

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const fire = () => {
      nowRef.current = Date.now();
      if (!vibMag?.length || !noiseTrend?.length || !rpmPmTrend?.length) return;

      let v = 0, n = 0, rpm = 0, pm = 0;

      if (mode === "avg") {
        const vAvg = averageWindow(vibMag, "v", windowMs);
        const nAvg = averageWindow(noiseTrend, "n", windowMs);
        const rpmAvg = averageWindow(rpmPmTrend, "rpm", windowMs);
        const pmAvg = averageWindow(rpmPmTrend, "pm", windowMs);

        v = vAvg && vAvg.count >= minSamplesForAvg ? vAvg.mean : (pickLatest(vibMag)?.v ?? 0);
        n = nAvg && nAvg.count >= minSamplesForAvg ? nAvg.mean : (pickLatest(noiseTrend)?.n ?? 0);
        rpm = rpmAvg && rpmAvg.count >= minSamplesForAvg ? rpmAvg.mean : (pickLatest(rpmPmTrend)?.rpm ?? 0);
        pm  = pmAvg && pmAvg.count >= minSamplesForAvg ? pmAvg.mean  : (pickLatest(rpmPmTrend)?.pm  ?? 0);
      } else {
        v   = pickLatest(vibMag)?.v ?? 0;
        n   = pickLatest(noiseTrend)?.n ?? 0;
        rpm = pickLatest(rpmPmTrend)?.rpm ?? 0;
        pm  = pickLatest(rpmPmTrend)?.pm ?? 0;
      }

      setStatus({
        hot: hotSeed,
        vibration: round2(v),
        noise: round2(n),
        rpm: round0(rpm),
        pm: round2(pm),
      });
    };

    // 즉시 1회 갱신 후, tickMs 주기로 반복
    fire();
    id = setInterval(fire, tickMs);

    return () => {
      if (id) clearInterval(id);
    };
  }, [mode, windowMs, minSamplesForAvg, hotSeed, tickMs, vibMag, noiseTrend, rpmPmTrend]);

  // 외부에서 hotSeed가 바뀌면 즉시 반영
  const statusWithHot = useMemo(() => ({ ...status, hot: hotSeed }), [status, hotSeed]);

  return statusWithHot;
}



// import { useEffect, useMemo, useRef, useState } from "react";

// type VibMag = { ts: number; t: string; v: number };
// type NoisePt = { ts: number; t: string; n: number };
// type RpmPmPt = { ts: number; t: string; rpm: number; pm: number };

// type Hot = { engine: number; hydraulic: number };
// type Status = {
//   hot: Hot;
//   vibration: number; // m/s²
//   noise: number;     // dB
//   rpm: number;
//   pm: number;        // ppm (또는 단위에 맞게)
// };

// type Options = {
//   mode?: "latest" | "avg";
//   hotSeed?: Hot;
//   windowMs?: number;
//   minSamplesForAvg?: number;
// };

// export function useStatusEveryMinute(
//   vibMag: VibMag[],
//   noiseTrend: NoisePt[],
//   rpmPmTrend: RpmPmPt[],
//   {
//     mode = "latest",
//     hotSeed = { engine: 42, hydraulic: 38 },
//     windowMs = 60_000,
//     minSamplesForAvg = 3,
//   }: Options = {}
// ) {
//   const [status, setStatus] = useState<Status>({
//     hot: hotSeed,
//     vibration: 0,
//     noise: 0,
//     rpm: 0,
//     pm: 0,
//   });

//   // 헬퍼들
//   const round2 = (x: number) => Math.round(x * 100) / 100;
//   const round0 = (x: number) => Math.round(x);

//   const nowRef = useRef<number>(Date.now());
//   nowRef.current = Date.now();

//   const pickLatest = <T,>(arr: T[]) => (arr?.length ? arr[arr.length - 1] : undefined);

//   const averageWindow = <T extends { ts: number }>(
//     arr: T[],
//     key: keyof T,
//     window: number
//   ) => {
//     const cutoff = nowRef.current - window;
//     const win = arr.filter((p) => p.ts >= cutoff);
//     if (win.length === 0) return undefined;
//     const sum = win.reduce((acc, p) => acc + (Number(p[key]) || 0), 0);
//     return { mean: sum / win.length, count: win.length };
//   };

//   // 첫 실행을 “다음 분” 정각에 맞추고, 이후 1분마다 갱신
//   useEffect(() => {
//     const fire = () => {
//       if (!vibMag?.length || !noiseTrend?.length || !rpmPmTrend?.length) return;

//       let v = 0, n = 0, rpm = 0, pm = 0;

//       if (mode === "avg") {
//         const vAvg = averageWindow(vibMag, "v", windowMs);
//         const nAvg = averageWindow(noiseTrend, "n", windowMs);
//         const rpmAvg = averageWindow(rpmPmTrend, "rpm", windowMs);
//         const pmAvg = averageWindow(rpmPmTrend, "pm", windowMs);

//         v = vAvg && vAvg.count >= minSamplesForAvg ? vAvg.mean : (pickLatest(vibMag)?.v ?? 0);
//         n = nAvg && nAvg.count >= minSamplesForAvg ? nAvg.mean : (pickLatest(noiseTrend)?.n ?? 0);
//         rpm = rpmAvg && rpmAvg.count >= minSamplesForAvg ? rpmAvg.mean : (pickLatest(rpmPmTrend)?.rpm ?? 0);
//         pm  = pmAvg && pmAvg.count >= minSamplesForAvg ? pmAvg.mean  : (pickLatest(rpmPmTrend)?.pm  ?? 0);
//       } else {
//         v   = pickLatest(vibMag)?.v ?? 0;
//         n   = pickLatest(noiseTrend)?.n ?? 0;
//         rpm = pickLatest(rpmPmTrend)?.rpm ?? 0;
//         pm  = pickLatest(rpmPmTrend)?.pm ?? 0;
//       }

//       setStatus({
//         hot: hotSeed, // 추후 온도도 실시간 소스로 교체 가능
//         vibration: round2(v),
//         noise: round2(n),
//         rpm: round0(rpm),
//         pm: round2(pm),
//       });
//     };

//     // 다음 분 정각까지 대기
//     const msToNextMinute = 60_000 - (Date.now() % 60_000);
//     const t0 = setTimeout(() => {
//       fire(); // 정각에 한 번
//       const id = setInterval(fire, 60_000); // 매 1분마다
//       (t0 as any).__id = id; // clearInterval 접근 위해 저장
//     }, msToNextMinute);

//     return () => {
//       const id = (t0 as any).__id;
//       if (id) clearInterval(id);
//       clearTimeout(t0);
//     };
//   }, [mode, windowMs, minSamplesForAvg, hotSeed, vibMag, noiseTrend, rpmPmTrend]);

//   // 외부에서 hotSeed가 바뀌면 즉시 반영
//   const statusWithHot = useMemo(() => ({ ...status, hot: hotSeed }), [status, hotSeed]);

//   return statusWithHot;
// }
