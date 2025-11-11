// src/components/EllipsisCell.jsx
import { useEffect, useRef, useState } from "react";
import { Tooltip, Box } from "@mui/material";

export default function EllipsisCell({
  value,
  align = "center",
  sx,
  tooltipPlacement = "top",
}) {
  const ref = useRef(null);
  const [overflowed, setOverflowed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowed(el.scrollWidth > el.clientWidth);
    check();
    // 폰트 로딩/리사이즈에도 다시 계산
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [value]);

  const content = (
    <Box
      ref={ref}
      sx={{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        textAlign: align,
        ...sx,
      }}
    >
      {value ?? "-"}
    </Box>
  );

  return overflowed ? (
    <Tooltip title={value} placement={tooltipPlacement} arrow>
      {/* span으로 감싸야 툴팁 포커스 영역이 안정적 */}
      <span style={{ display: "block" }}>{content}</span>
    </Tooltip>
  ) : (
    content
  );
}
