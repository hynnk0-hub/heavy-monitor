// src/components/ThermalCard.jsx
import { Box } from "@mui/material";
import CardShell from "./CardShell";

export default function ThermalCard({ title, src }) {
  return (
    <CardShell title={title} > {/* 카드가 타일 높이 100% 차도록 */}
      {/* 이미지 박스: 가운데 정렬 + 세로 100% */}
      <Box
        sx={{
          width: "100%", 
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: "8px"
        }}
      >
        <Box
          component="img"
          src={src}
          alt={title}
          sx={{
            height: "80%",
            maxWidth: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      </Box>
    </CardShell>
  );
}
