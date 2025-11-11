// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: { main: "#0f86c7" },     // 상단 바의 청록-파랑
    background: { default: "#eef1f4", paper: "#ffffff" },
    text: { primary: "#1e293b", secondary: "#64748b" },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #e7ebf0",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        },
      },
    },
  },
  typography: { fontFamily: `"Pretendard",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto` },
});

export default theme;
