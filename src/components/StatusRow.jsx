// src/components/StatusRow.jsx
import { Box, Typography, Paper } from "@mui/material";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import SpeedIcon from "@mui/icons-material/Speed";
import BlurOnIcon from "@mui/icons-material/BlurOn";

const iconMap = {
  hot: <WhatshotIcon fontSize="small" />,
  vib: <MonitorHeartIcon fontSize="small" />,
  noise: <VolumeUpIcon fontSize="small" />,
  rpm: <SpeedIcon fontSize="small" />,
  pm: <BlurOnIcon fontSize="small" />,
};

const dotColor = (t) =>
  t === "error" ? "#ff3b30" : t === "warning" ? "#ffd60a" : "#2ecc71";

const normalizeValues = (val, defaultDot = "success") => {
  if (Array.isArray(val)) {
    return val.map((v) =>
      typeof v === "string" ? { text: v, dot: defaultDot } : v
    );
  }
  if (typeof val === "object" && val?.text) return [val];
  return [{ text: String(val), dot: defaultDot }];
};

// 좌측 세로바 컬러
const ACCENT = "#19A0D2";

// 도트 판정 규칙
// 진동: 통상 1.3~2.0 → 범위 밖이면 error, 안이면 success
const vibDot = (v) => {
  if (typeof v !== "number") return "success";
  return v < 1.3 || v > 2.0 ? "error" : "success";
};

// 소음: 80~<95 success, 95~<120 warning, ≥120 error, <80 warning
const noiseDot = (n) => {
  if (typeof n !== "number") return "success";
  if (n >= 120) return "error";
  if (n >= 95) return "warning";
  if (n < 80) return "warning";
  return "success";
};

// RPM: 항상 success
const rpmDot = () => "success";

// PM(매연): 0~<900 success, 900~<1000 warning, ≥1000 error  (단위: ppm)
const pmDot = (p) => {
  if (typeof p !== "number") return "success";
  if (p >= 1000) return "error";
  if (p >= 900) return "warning";
  return "success";
};

/**
 * StatusRow
 * @param {object}   props.data        - { hot:{engine,hydraulic}, vibration, noise, rpm, pm }
 * @param {string[]} [props.onlyKeys]  - ['hot','vib','noise','rpm','pm'] 중 일부만 표시
 * @param {object}   [props.hotLimits] - 세트별 한계치 { engine:{low,high}, hydraulic:{low,high} }
 */
export default function StatusRow({ data, onlyKeys, hotLimits }) {
  const tempDot = (key, t) => {
    const lim = hotLimits?.[key]; // key: "engine" | "hydraulic"
    if (lim && typeof t === "number") {
      if (t >= lim.high) return "error";
      if (t >= lim.low) return "warning";
      return "success";
    }
    // fallback (이전 기본 규칙)
    return t >= 60 ? "error" : t >= 40 ? "warning" : "success";
  };

  const itemsAll = [
    {
      key: "hot",
      label: "열화상(Hot Spot)",
      val: [
        {
          text: `엔진룸 ${Number(data?.hot?.engine ?? 0).toFixed(1)} °C`,
          dot: tempDot("engine", data?.hot?.engine),
        },
        {
          text: `유압장비 ${Number(data?.hot?.hydraulic ?? 0).toFixed(1)} °C`,
          dot: tempDot("hydraulic", data?.hot?.hydraulic),
        },
      ],
    },
    {
      key: "vib",
      label: "진동",
      val: {
        text: `${Number(data?.vibration ?? 0).toFixed(2)} m/s²`,
        dot: vibDot(data?.vibration),
      },
    },
    {
      key: "noise",
      label: "소음",
      val: {
        text: `${Number(data?.noise ?? 0).toFixed(2)} dB(A)`,
        dot: noiseDot(data?.noise),
      },
    },
    {
      key: "rpm",
      label: "RPM",
      val: {
        text: `${Number(data?.rpm ?? 0)}`,
        dot: rpmDot(data?.rpm),
      },
    },
    {
      key: "pm",
      label: "매연",
      val: {
        text: `${Number(data?.pm ?? 0).toFixed(2)} ppm`,
        dot: pmDot(data?.pm),
      },
    },
  ];

  const items = onlyKeys ? itemsAll.filter((it) => onlyKeys.includes(it.key)) : itemsAll;

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "repeat(1, minmax(0, 1fr))",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(5, minmax(0, 1fr))",
        },
        width: "100%",
        gridAutoRows: "120px",
      }}
    >
      {items.map((it) => {
        const values = normalizeValues(it.val, it.dot);
        return (
          <Paper
            key={it.key}
            sx={{
              p: 1,
              pl: 3,
              pr: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              justifyContent: "space-between",
              boxSizing: "border-box",
              height: "100%",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 12,
                borderRadius: "6px 0px 0px 6px",
                background: ACCENT,
              },
            }}
          >
            {/* 아이콘 + 라벨 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1 }}>
              <Box sx={{ fontSize: 25, lineHeight: 0, color: "text.secondary" }}>
                {iconMap[it.key] ?? iconMap.pm}
              </Box>
              <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 700 }}>
                {it.label}
              </Typography>
            </Box>

            {/* 값 + 도트 */}
            <Box sx={{
                flex: 1,
                minWidth: 0,
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                mt: 0.25,
              }}>
              <Box alignContent='end' sx={{ display: "grid", gap: 0.25, mt: 0.25, minHeight: 52 }}>
                {values.map(({ text, dot }, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      columnGap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                      }}
                      title={text}
                    >
                      {text}
                    </Typography>

                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        bgcolor: dotColor(dot),
                        boxShadow: "0 0 0 2px rgba(0,0,0,0.06)",
                        justifySelf: "end",
                      }}
                    />
                  </Box>
                ))}
              </Box>
              {values.length === 1 && <Box sx={{ flex: 1 }} />}
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
