// App.jsx
import React, { useMemo, useState, useEffect } from "react";
import { GlobalStyles } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Box } from "@mui/material";
import theme from "./theme";
import TopBar from "./components/TopBar";
import Sidebar from "./components/Sidebar";
import StatusRow from "./components/StatusRow";
import { useStatusEveryMinute } from "./hooks/useStatusEveryMinute";
import ThermalCard from "./components/ThermalCard";
import { MultiLineCard } from "./components/MultiLineCard";
import { VibTrendChart } from "./components/VibTrendChart";
import { TrendLineCard } from "./components/TrendLineCard";
import { RpmPmCard } from "./components/RpmPmCard";
import { vehicles, specDetail, history, SETS } from "./data/fakeData";
import { useVibFeed } from "./hooks/useVibFeed";
import { useNoiseFeed } from "./hooks/useNoiseFeed";
import { useRpmPmFeed } from "./hooks/useRpmPmFeed";

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const base = import.meta.env.BASE_URL;

export default function App() {
  const [selectedVin, setSelectedVin] = useState(vehicles?.[0] ?? "");

  // const [engineImg, setEngineImg] = useState(() => `/img/${pick(ENGINE)}`);
  // const [hydImg, setHydImg]       = useState(() => `/img/${pick(HYD)}`);

  const [setIdx, setSetIdx] = useState(0);
  const currentSet = SETS[setIdx % SETS.length];
  const engineImg = `${base}img/${currentSet.engineImg}`;
  const hydImg    = `${base}img/${currentSet.hydImg}`;

  const vibAxes = useVibFeed({ intervalMs: 2000, maxPoints: 20 });
  // √(x² + y² + z²) 계산해서 {ts, t, v}로매핑
  const vibMag = useMemo(
    () =>
      vibAxes.map(p => ({
        ts: p.ts,
        t: p.t,
        v: Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z),
      })),
    [vibAxes]
  );
  const noiseTrend = useNoiseFeed({ intervalMs: 2000, maxPoints: 20 });
  const rpmPmTrend = useRpmPmFeed({ intervalMs: 2000, maxPoints: 30 });

  const pickDifferent = (pool, prevUrl) => {
    const prevName = (prevUrl || "").split("/").pop()?.split("?")[0];
    if (pool.length <= 1) return `${base}img/${pool[0]}`;
    let next = prevName;
    while (next === prevName) next = pick(pool);
    return `${base}img/${next}`;
  };

  useEffect(() => {
  const INTERVAL = 60000;
  let intervalId = null;
  let timeoutId = null;

  // 1) 현재 시각으로 즉시 세트 설정 (정각 정렬)
  const alignIndex = () => {
    const slot = Math.floor(Date.now() / INTERVAL) % SETS.length;
    setSetIdx(slot);
  };
  alignIndex();

  // 2) 다음 정각까지 대기 → 이후 1분마다 갱신
  const schedule = () => {
    const msToNextMinute = INTERVAL - (Date.now() % INTERVAL);
    timeoutId = setTimeout(() => {
      alignIndex(); // 정각에 한 번 맞추고
      intervalId = setInterval(() => {
        setSetIdx((i) => {
          const next = (i + 1) % SETS.length;
          return next;
        });
      }, INTERVAL);
    }, msToNextMinute);
  };
  schedule();

  // 3) 탭 비활성화 시엔 중지, 활성화 시 재스케줄
  const onVis = () => {
    if (document.hidden) {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      intervalId = null;
      timeoutId = null;
    } else {
      // 재정렬 후 다시 스케줄
      alignIndex();
      schedule();
    }
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    if (intervalId) clearInterval(intervalId);
    if (timeoutId) clearTimeout(timeoutId);
    document.removeEventListener("visibilitychange", onVis);
  };
}, [SETS.length]);


  const statusLive = useStatusEveryMinute(
    vibMag,
    noiseTrend,
    rpmPmTrend,
    {
      mode: "latest",                     // 필요하면 "avg"
      hotSeed: currentSet.hot,            // ← 세트의 hot 연동
      windowMs: 60_000,
      minSamplesForAvg: 3,
    }
  );


  const selectedDetail = useMemo(() => {
    return specDetail.find(d => d?.차대번호 === selectedVin) ?? {};
  }, [selectedVin]);

  const selectedHistory = history;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles styles={{
        "html, body, #root": { height: "100%", overflow: "hidden" },
        /* Firefox */
        ":root": {
          scrollbarColor: "rgba(25,160,210,0.6) rgba(0,0,0,0.06)", 
          scrollbarWidth: "thin",
        },
        /* WebKit(Chrome/Edge/Safari) */
        "*::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "*::-webkit-scrollbar-track": {
          background: "rgba(0,0,0,0.06)", 
          borderRadius: "8px",
        },
        "*::-webkit-scrollbar-thumb": {
          background: "rgba(25,160,210,0.7)", 
          borderRadius: "8px",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          background: "rgba(25,160,210,0.9)",
        },
        "*::-webkit-scrollbar-corner": { background: "transparent" }, 
      }} />
      <Box sx={{ height: "100vh", width: "100vw", bgcolor: "background.default", overflow: "hidden" }}>
        <TopBar />
        <Box sx={{ height: "calc(100vh - 64px)", display: "flex", gap: 2, p: 2, boxSizing: "border-box" }}>
          {/* 왼쪽 사이드 */}
          <Sidebar
            vehicles={vehicles}
            detail={selectedDetail}
            history={selectedHistory}
            onSearch={(vin) => setSelectedVin(vin)}
          />

          {/* 오른쪽 콘텐츠 */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pr: 0.5,
            }}
          >
            {/* StatusRow 영역 */}
            <Box sx={{ flexShrink: 0, mb: 2 }}>
                <StatusRow
                  data={statusLive}
                  hotLimits={{
                    engine:    { low: currentSet.lowLimit.engine,    high: currentSet.highLimit.engine },
                    hydraulic: { low: currentSet.lowLimit.hydraulic, high: currentSet.highLimit.hydraulic },
                  }}
                />
            </Box>

            {/* 카드 3×2 섹션 */}
            <Box sx={{ flex: 1, minHeight: 0  }}>
              <Box
                sx={{
                  height: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",         
                  gridTemplateRows: "repeat(2, minmax(0, 1fr))", 
                  gap: 2,
                  alignItems: "stretch",
                  overflow: "hidden",
                }}
              >
                <ThermalCard title="엔진룸 열화상 모니터링" src={engineImg} height="100%" />
                <MultiLineCard
                  title="진동 축별 트렌드 차트"
                  data={vibAxes}
                  height="100%"
                  lineWidth={2}
                  yMin={1}
                  yMax={2}
                  series={[
                    { key: "x", name: "x", color: "#1e88e5" },
                    { key: "y", name: "y", color: "#43a047" },
                    { key: "z", name: "z", color: "#ff7043" },
                  ]}
                />
                {/* <VibTrendChart title="진동(|𝑎|) 트렌드 차트" data={vibMag} lineWidth={2} yKey="v" yMin={1.5} yMax={3} height="100%" /> */}
                <VibTrendChart
                  title="진동(|𝑎|) 트렌드 차트"
                  data={vibMag}
                  yKey="v"
                  color="#1e88e5"
                  height="100%"
                  lineWidth={2}
                  yMin={1.5}
                  yMax={3}
                  base="yMin"
                  isAnimationActive={false}
                  seriesName="진동(|𝑎|)"
                />

                <ThermalCard title="유압 장비 열화상 모니터링" src={hydImg} height="100%" />
                {/* <TrendLineCard title="소음 SPL(dB) 트렌드 차트" data={noiseTrend} lineWidth={2} yKey="n" yMin={80} yMax={120} height="100%" /> */}
                <TrendLineCard
                  title="소음 SPL(dB) 트렌드 차트"
                  data={noiseTrend}  // [{ ts?, t, n }]
                  yKey="n"
                  color="#b24eceff"
                  lineWidth={2}
                  yMin={80}
                  yMax={120}
                  height="100%"
                  base="yMin"
                  seriesName="SPL"
                />
                <RpmPmCard data={rpmPmTrend} height="100%" lineWidth={2} leftMin={0} leftMax={1000} rightMin={0} rightMax={30} leftLabel="RPM" rightLabel="매연 (%vol)" />
              </Box>
            </Box>
          </Box>

        </Box>
      </Box>
    </ThemeProvider>
  );
}
