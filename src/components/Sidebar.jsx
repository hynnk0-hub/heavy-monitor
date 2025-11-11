// src/components/Sidebar.jsx
import { useMemo, useRef, useState, useCallback } from "react";
import {
  Box, TextField, Table, TableHead, TableBody, TableRow, TableCell,
  Chip, InputAdornment, Autocomplete, IconButton
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import CardShell from "./CardShell";
import { createFilterOptions } from "@mui/material/Autocomplete";

export default function Sidebar({ showLeadingIcon = false, vehicles = [], detail = {}, history = [], onSearch }) {
  const [query, setQuery] = useState("");           // ← 검색어가 여기에 남습니다
  const [ghostPlaceholder, setGhostPlaceholder] = useState(""); // 마지막 검색값(placeholder로 표시)

  const composingRef = useRef(false);

  const optionLabel = (opt) => (typeof opt === "string" ? opt : opt?.label ?? opt?.vin ?? "");
  const optionValue = (opt) => (typeof opt === "string" ? opt : opt?.vin ?? opt?.label ?? "");

  const filter = useMemo(() => createFilterOptions({
    stringify: optionLabel,
    trim: true,
  }), []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vehicles.slice(0, 20);
    return vehicles.filter((v) => optionLabel(v).toLowerCase().includes(q)).slice(0, 20);
  }, [vehicles, query]);

  const fireSearch = useCallback((raw) => {
    const q = (raw ?? query).trim();
    if (!q) return;

    const exact = vehicles.find((v) => optionLabel(v) === q);
    const partial = vehicles.find((v) => optionLabel(v).toLowerCase().includes(q.toLowerCase()));
    const target = exact ?? partial ?? q;

    const label = optionLabel(target);
    const value = optionValue(target);

    setGhostPlaceholder(label); 
    setQuery(label);          
    onSearch?.(value);        
  }, [query, vehicles, onSearch]);

  return (
    <Box sx={{ width: 420, minWidth: 360, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* 차대 번호 검색 */}
      <CardShell title="차대 번호">
        <Autocomplete
          freeSolo
          size="small"
          options={filteredOptions}
          filterOptions={filter}
          value={null}                         
          inputValue={query}                   
          onInputChange={(_, val) => setQuery(val ?? "")}
          onChange={(_, val) => fireSearch(val)}   
          getOptionLabel={optionLabel}
          noOptionsText={query ? "검색 결과 없음" : "입력해 주세요"}
          disableClearable                     
          forcePopupIcon={false}               
          renderOption={(props, option) => (
            <li
              {...props}
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              }}
            >
              {optionLabel(option)}
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={ghostPlaceholder || "차대 번호 검색"}  
               sx={{
                "& .MuiOutlinedInput-root": {
                    bgcolor: "#FFF",
                    borderRadius: 2,
                },
                "& .MuiOutlinedInput-input": {
                    color: "#222",          
                    caretColor: "#222",     
                    "::placeholder": {
                    opacity: 1,
                    color: "rgba(255,255,255,0.6)",
                    },
                },
                "& .MuiSvgIcon-root": { color: "#222" },
                }}
              InputProps={{
                ...params.InputProps,
                startAdornment: showLeadingIcon ? (
                  <InputAdornment position="start">
                    <SearchIcon htmlColor="#fff" />
                  </InputAdornment>
                ) : undefined,
                endAdornment: (
                  <>
                    {query && (
                      <IconButton
                        size="small"
                        aria-label="clear"
                        onClick={() => setQuery("")}
                        edge="end"
                        tabIndex={-1}
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      aria-label="search"
                      onClick={() => fireSearch()}
                      edge="end"
                      tabIndex={-1}
                    >
                      <SearchIcon />
                    </IconButton>
                    {params.InputProps.endAdornment}
                  </>
                ),
                sx: { color: "#fff" },
              }}
              onCompositionStart={() => (composingRef.current = true)}
              onCompositionEnd={() => (composingRef.current = false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (composingRef.current) return; // 한글 조합 중 Enter 무시
                  e.preventDefault();
                  fireSearch();
                }
              }}
            />
          )}
        />
      </CardShell>

      {/* 상세 제원 정보 */}
      <CardShell title="상세 제원 정보" sx={{ flex: 1, minHeight: 320, overflow: "hidden" }}>
        <Box sx={{ maxHeight: "100%", overflow: "auto", pr: 1, borderRadius: "8px", border: "1px solid rgba(34,34,34,0.2)" }}>
          <Table size="small">
            <TableBody sx={{ cursor: "default" }}>
              {Object.entries(detail).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell sx={{ width: 100, color: "#FFF", background: "#19A0D2" }}>{k}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{String(v)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardShell>

      {/* 검사 이력 */}
      {/* <CardShell title="검사 이력">
        <Box
          sx={{
            width: 386,
            borderRadius: 1,
            border: "1px solid rgba(34,34,34,0.2)",
            overflowX: "hidden",
            overflowY: "scroll"
          }}
        > */}
      <CardShell title="검사 이력" sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            width: 386,
            borderRadius: 1,
            border: "1px solid rgba(34,34,34,0.2)",
            overflowX: "hidden",
            overflowY: "auto",       // ← 넘칠 때만
            maxHeight: 320           // ← 필요 높이로 조정(원하면 더 크게/작게)
          }}
        >
          <Table size="small" sx={{ tableLayout: "fixed", width: 386 }}>
            <colgroup>
              <col style={{ width: 72 }} />   {/* 검사 날짜 */}
              <col style={{ width: 128 }} />  {/* 검사 기관 */}
              <col style={{ width: 60 }} />   {/* 검사자 */}
              <col style={{ width: 72 }} />   {/* 검사 결과 */}
              <col style={{ width: 54 }} />   {/* 비고 */}
            </colgroup>

            <TableHead sx={{ background: "#0097CE" }}>
              <TableRow sx={{ cursor: "default" }}>
                <TableCell sx={{ p: 1, lineHeight: 1, textAlign: "center", color: "#FFF" }}>검사날짜</TableCell>
                <TableCell sx={{ p: 1, lineHeight: 1, textAlign: "center", color: "#FFF" }}>검사 기관</TableCell>
                <TableCell sx={{ p: 1, lineHeight: 1, textAlign: "center", color: "#FFF" }}>검사자</TableCell>
                <TableCell sx={{ p: 1, lineHeight: 1, textAlign: "center", color: "#FFF" }}>검사결과</TableCell>
                <TableCell sx={{ p: 1, lineHeight: 1, textAlign: "center", color: "#FFF" }}>비고</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {history.map((h, i) => (
                <TableRow key={i}>
                  <TableCell title={h.date}  sx={{ p: 1, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}>{h.date}</TableCell>
                  <TableCell title={h.place} sx={{ p: 1, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "pointer" }}>{h.place}</TableCell>
                  <TableCell                 sx={{ p: 1, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "default" }}>{h.name}</TableCell>
                  <TableCell sx={{ p: 1, textAlign: "center", cursor: "default" }}>
                    <Chip
                      label={h.result === "합" ? "합격" : "불합격"}
                      color={h.result === "합" ? "primary" : "error"}
                      size="small"
                      variant="outlined"
                      sx={{ height: 22, "& .MuiChip-label": { px: 0.75, fontSize: 11.5 } }}
                    />
                  </TableCell>
                  <TableCell sx={{ p: 1, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", cursor: "default" }}>
                    {h.note || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </CardShell>
    </Box>
  );
}
