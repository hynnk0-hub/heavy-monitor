// src/components/CardShell.jsx
import { Paper, Box, Typography } from "@mui/material";

export default function CardShell({ title, children, sx, contentSx }) {
  return (
    <Paper sx={{ p: 2, display: "flex", flexDirection: "column", minHeight: 0, ...sx }}>
      <Box sx={{ width: "100%", display: "flex", alignItems: "center", mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, width: "100%", textAlign: "center" }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", ...contentSx }}>
        {children}
      </Box>
    </Paper>
  );
}
