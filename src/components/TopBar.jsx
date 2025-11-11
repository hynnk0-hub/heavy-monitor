// src/components/TopBar.jsx
import { AppBar, Toolbar, Typography, Box, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";

const base = import.meta.env.BASE_URL;

export default function TopBar() {
  return (
    <AppBar position="static" elevation={0} sx={{ px: 2, bgcolor: "#0097CE" }}>
      <Toolbar disableGutters sx={{ gap: 2 }}>
        {/* 좌측 로고 자리 */}
        <Box sx={{ width: "auto", height: 50, display: "flex", alignItems: "center", px: 1, borderRadius: 1 }}>
          <Box
            component="img"
            src={`${base}img/logo.png}`}
            alt="logo"
            sx={{ height: "100%", display: "block" }}
          />
        </Box>

        <Typography
          variant="h5"
          sx={{ flexGrow: 1, fontWeight: 800, textAlign: "center", userSelect: "none" }}
        >
          중장비 모니터링 시스템
        </Typography>

        <IconButton edge="end" color="inherit" aria-label="검색">
          <SearchIcon />
        </IconButton>
        <IconButton edge="end" color="inherit" aria-label="사용자 메뉴">
          <PersonIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
