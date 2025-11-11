import React from "react";
import { Grid, Paper, Typography, Box } from "@mui/material";

const StatusCards = ({ data }) => {
  const statusItems = [
    { label: "열화상(Hot Spot)", value: `${data.hotspot}℃`, color: "#ff7043" },
    { label: "진동", value: `${data.vibration} m/s²`, color: "#26a69a" },
    { label: "소음", value: `${data.noise} dB(A)`, color: "#42a5f5" },
    { label: "RPM", value: data.rpm, color: "#ffca28" },
    { label: "매연", value: `${data.pm} ppm`, color: "#ab47bc" },
  ];

  return (
    <Grid container spacing={2}>
      {statusItems.map((item) => (
        <Grid item xs={2.4} key={item.label}>
          <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fff" }}>
            <Typography variant="body2" sx={{ color: "#666" }}>
              {item.label}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: "bold", color: item.color }}
            >
              {item.value}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatusCards;
