"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import * as XLSX from "xlsx";
import { api } from "~/trpc/react";
import { Dialog, DialogHeader, DialogBody } from "~/app/_components/widgets/Dialog";
import { Button } from "~/app/_components/widgets/Button";
import { TextField } from "~/app/_components/widgets/TextField";
import { useThemeColors } from "~/theme/useThemeColors";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedRow {
  title: string;
  pmid?: string;
  authors?: string;
  citation?: string;
  firstAuthor?: string;
  journal?: string;
  publicationYear?: number;
  createDate?: string;
  pmcid?: string;
  nihmsId?: string;
  doi?: string;
}

type Resolution = "skip" | "overwrite" | "keep_both";
type FieldSource = "existing" | number; // number = index into incomingRows
type MergeableField = "title" | "authors" | "journal" | "publicationYear" | "doi";

interface ExistingArticle {
  id: string;
  pmid: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  publicationYear: number | null;
  doi: string | null;
  version: number;
}

interface BlankPmidEntry {
  editedRow: ParsedRow;
  isDirty: boolean;
  isEditing: boolean;
  skip: boolean;
}

interface ConflictEntry {
  incomingRows: ParsedRow[];
  existing: ExistingArticle;
  resolution: Resolution;
  fieldSources: Record<MergeableField, FieldSource>;
}

interface SummaryData {
  created: number;
  updated: number;
  keptBoth: number;
  skipped: number;
  autoSkipped: number;
}

type Phase = "upload" | "resolving" | "summary";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MERGEABLE_FIELDS: MergeableField[] = ["title", "authors", "journal", "publicationYear", "doi"];

const FIELD_LABELS: Record<MergeableField, string> = {
  title: "Title",
  authors: "Authors",
  journal: "Journal",
  publicationYear: "Year",
  doi: "DOI",
};

function norm(v: string | number | null | undefined) {
  return String(v ?? "").trim().toLowerCase();
}

function isIdentical(row: ParsedRow, existing: ExistingArticle) {
  return (
    norm(row.title) === norm(existing.title) &&
    norm(row.authors) === norm(existing.authors) &&
    norm(row.journal) === norm(existing.journal) &&
    norm(row.publicationYear) === norm(existing.publicationYear) &&
    norm(row.doi) === norm(existing.doi)
  );
}

function defaultFieldSources(): Record<MergeableField, FieldSource> {
  return { title: "existing", authors: "existing", journal: "existing", publicationYear: "existing", doi: "existing" };
}

function getFieldValFromRow(field: MergeableField, row: ParsedRow): string {
  if (field === "title") return row.title;
  if (field === "authors") return row.authors ?? "";
  if (field === "journal") return row.journal ?? "";
  if (field === "publicationYear") return row.publicationYear?.toString() ?? "";
  return row.doi ?? "";
}

function getFieldValFromExisting(field: MergeableField, existing: ExistingArticle): string {
  if (field === "title") return existing.title;
  if (field === "authors") return existing.authors ?? "";
  if (field === "journal") return existing.journal ?? "";
  if (field === "publicationYear") return existing.publicationYear?.toString() ?? "";
  return existing.doi ?? "";
}

function getMergedRow(entry: ConflictEntry): ParsedRow {
  const { existing, fieldSources, incomingRows } = entry;

  function pickVal<T>(f: MergeableField, existingVal: T, getFromRow: (r: ParsedRow) => T): T {
    const source = fieldSources[f];
    if (source === "existing") return existingVal;
    return getFromRow(incomingRows[source] ?? incomingRows[0]!);
  }

  return {
    pmid: incomingRows[0]!.pmid,
    title: pickVal("title", existing.title, (r) => r.title),
    authors: pickVal("authors", existing.authors ?? undefined, (r) => r.authors),
    journal: pickVal("journal", existing.journal ?? undefined, (r) => r.journal),
    publicationYear: pickVal("publicationYear", existing.publicationYear ?? undefined, (r) => r.publicationYear),
    doi: pickVal("doi", existing.doi ?? undefined, (r) => r.doi),
  };
}

function buildEntries(
  conflicts: { incomingRow: ParsedRow; existing: ExistingArticle }[],
): { entries: ConflictEntry[]; autoSkipped: number } {
  const grouped = new Map<string, { incomingRows: ParsedRow[]; existing: ExistingArticle }>();
  for (const c of conflicts) {
    const pmid = c.incomingRow.pmid ?? "__no_pmid__";
    if (!grouped.has(pmid)) {
      grouped.set(pmid, { incomingRows: [], existing: c.existing });
    }
    grouped.get(pmid)!.incomingRows.push(c.incomingRow);
  }

  let autoSkipped = 0;
  const entries: ConflictEntry[] = [];
  for (const { incomingRows, existing } of grouped.values()) {
    if (incomingRows.every((r) => isIdentical(r, existing))) {
      autoSkipped += incomingRows.length;
      continue;
    }
    entries.push({
      incomingRows,
      existing,
      resolution: "skip",
      fieldSources: defaultFieldSources(),
    });
  }
  return { entries, autoSkipped };
}

// ─── XLSX parsing ─────────────────────────────────────────────────────────────

const COL_MAP: Record<string, keyof ParsedRow> = {
  "title": "title",
  "pmid": "pmid",
  "authors": "authors",
  "citation": "citation",
  "first author": "firstAuthor",
  "journal/book": "journal",
  "journal": "journal",
  "publication year": "publicationYear",
  "create date": "createDate",
  "pmcid": "pmcid",
  "nihms id": "nihmsId",
  "nihmsid": "nihmsId",
  "doi": "doi",
};

function parseSheet(workbook: XLSX.WorkBook): { rows: ParsedRow[]; skipped: number } {
  const sheet = workbook.Sheets[workbook.SheetNames[0]!]!;
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const rows: ParsedRow[] = [];
  let skipped = 0;
  for (const rawRow of raw) {
    const row: Partial<ParsedRow> = {};
    for (const [key, val] of Object.entries(rawRow)) {
      const mapped = COL_MAP[key.toLowerCase().trim()];
      if (!mapped) continue;
      const strVal = String(val ?? "").trim();
      if (!strVal) continue;
      if (mapped === "publicationYear") {
        const n = parseInt(strVal, 10);
        if (!isNaN(n)) row.publicationYear = n;
      } else {
        (row as Record<string, unknown>)[mapped] = strVal;
      }
    }
    if (!row.title) { skipped++; continue; }
    rows.push(row as ParsedRow);
  }
  return { rows, skipped };
}

// ─── ResolutionToggle ─────────────────────────────────────────────────────────

function ResolutionToggle({ value, onChange }: { value: Resolution; onChange: (r: Resolution) => void }) {
  const c = useThemeColors();
  const options: { key: Resolution; label: string }[] = [
    { key: "skip", label: "Skip" },
    { key: "overwrite", label: "Overwrite" },
    { key: "keep_both", label: "Keep All" },
  ];
  return (
    <Box sx={{ display: "inline-flex", border: `1px solid ${c.surface1}`, borderRadius: "4px", overflow: "hidden" }}>
      {options.map((opt, idx) => {
        const isActive = value === opt.key;
        return (
          <Box
            key={opt.key}
            component="button"
            onClick={() => onChange(opt.key)}
            sx={{
              px: 1.25, py: 0.4, fontSize: "0.7rem", fontWeight: isActive ? 600 : 400,
              backgroundColor: isActive ? c.blue : "transparent",
              color: isActive ? "#ffffff" : c.overlay1,
              border: "none", borderLeft: idx > 0 ? `1px solid ${c.surface1}` : "none",
              cursor: "pointer", transition: "background-color 0.1s ease, color 0.1s ease",
              "&:hover": !isActive ? { backgroundColor: c.surface0, color: c.text } : {},
            }}
          >
            {opt.label}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── ConflictRow ──────────────────────────────────────────────────────────────

function FieldCell({
  value,
  selected,
  active,
  onClick,
  c,
}: {
  value: string;
  selected: boolean;
  active: boolean;
  onClick: () => void;
  c: ReturnType<typeof useThemeColors>;
}) {
  return (
    <Tooltip title={value || ""} placement="top" enterDelay={400} disableHoverListener={!value}>
      <Box
        onClick={active ? onClick : undefined}
        sx={{
          px: 1, py: 0.5,
          border: `1px solid ${selected ? c.blue : c.surface1}`,
          backgroundColor: selected ? `${c.blue}18` : "transparent",
          borderRadius: "3px",
          cursor: active ? "pointer" : "default",
          fontSize: "0.76rem",
          color: selected ? c.text : c.overlay1,
          display: "flex", alignItems: "center", gap: 0.5, minWidth: 0,
          "&:hover": active && !selected ? { borderColor: c.overlay0 } : {},
        }}
      >
        {selected && <Box component="span" sx={{ color: c.blue, fontSize: "0.5rem", flexShrink: 0, lineHeight: 1 }}>●</Box>}
        <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || <Box component="span" sx={{ fontStyle: "italic", color: c.overlay0 }}>—</Box>}
        </Box>
      </Box>
    </Tooltip>
  );
}

function ConflictRow({
  entry,
  onUpdate,
}: {
  entry: ConflictEntry;
  onUpdate: (patch: Partial<ConflictEntry>) => void;
}) {
  const c = useThemeColors();
  const { existing, resolution, incomingRows, fieldSources } = entry;
  const isActive = resolution !== "skip";
  // dynamic grid: label col (fixed) + existing col + one col per incoming row (min 140px each)
  const colCount = 1 + incomingRows.length; // excluding label col
  const gridCols = `72px repeat(${colCount}, minmax(140px, 1fr))`;

  const selectSource = (field: MergeableField, source: FieldSource) => {
    if (!isActive) return;
    onUpdate({ fieldSources: { ...fieldSources, [field]: source } });
  };

  return (
    <Box sx={{ border: `1px solid ${c.surface0}`, backgroundColor: c.mantle, overflow: "hidden", flexShrink: 0, borderRadius: "4px" }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, backgroundColor: c.surface0 }}>
        <Box sx={{ fontSize: "0.72rem", fontWeight: 600, color: c.overlay1 }}>
          PMID: <Box component="span" sx={{ color: c.text }}>{incomingRows[0]!.pmid ?? "—"}</Box>
          {incomingRows.length > 1 && (
            <Box component="span" sx={{ color: c.overlay0, fontWeight: 400, ml: 1 }}>
              · {incomingRows.length} incoming entries
            </Box>
          )}
        </Box>
        <ResolutionToggle value={resolution} onChange={(r) => onUpdate({ resolution: r })} />
      </Box>

      {/* Diff table — horizontally scrollable when many entries */}
      <Box sx={{ opacity: isActive ? 1 : 0.4, transition: "opacity 0.15s ease", overflowX: "auto" }}>
        <Box sx={{ minWidth: `calc(72px + ${colCount} * 140px + ${colCount + 1} * 8px + 32px)` }}>
          {/* Column headers */}
          <Box sx={{ display: "grid", gridTemplateColumns: gridCols, px: 2, py: 0.75, gap: 1, borderBottom: `1px solid ${c.surface0}` }}>
            <Box />
            <Box sx={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.overlay0 }}>Existing</Box>
            {incomingRows.map((_, idx) => (
              <Box key={idx} sx={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.overlay0 }}>
                {incomingRows.length === 1 ? "Incoming" : `Entry ${idx + 1}`}
              </Box>
            ))}
          </Box>

          {MERGEABLE_FIELDS.map((field) => {
            const ev = getFieldValFromExisting(field, existing);
            const incomingVals = incomingRows.map((r) => getFieldValFromRow(field, r));
            const selectedSource = fieldSources[field];

            return (
              <Box
                key={field}
                sx={{ display: "grid", gridTemplateColumns: gridCols, px: 2, py: 0.75, gap: 1, borderBottom: `1px solid ${c.surface0}`, alignItems: "center" }}
              >
                <Box sx={{ fontSize: "0.67rem", color: c.overlay0, fontWeight: 500 }}>{FIELD_LABELS[field]}</Box>
                <FieldCell
                  value={ev}
                  selected={selectedSource === "existing"}
                  active={isActive}
                  onClick={() => selectSource(field, "existing")}
                  c={c}
                />
                {incomingRows.map((_, idx) => (
                  <FieldCell
                    key={idx}
                    value={incomingVals[idx]!}
                    selected={selectedSource === idx}
                    active={isActive}
                    onClick={() => selectSource(field, idx)}
                    c={c}
                  />
                ))}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

// ─── BlankPmidRow ─────────────────────────────────────────────────────────────

function BlankPmidRow({
  entry,
  onUpdate,
}: {
  entry: BlankPmidEntry;
  onUpdate: (patch: Partial<BlankPmidEntry>) => void;
}) {
  const c = useThemeColors();
  const { editedRow, isDirty, isEditing, skip } = entry;
  const meta = [editedRow.authors, editedRow.journal, editedRow.publicationYear].filter(Boolean).join(" · ");

  return (
    <Box
      sx={{
        border: `1px solid ${c.surface0}`,
        backgroundColor: c.mantle,
        borderRadius: "4px",
        flexShrink: 0,
        opacity: skip ? 0.6 : 1,
        transition: "opacity 0.15s ease",
      }}
    >
      <Box sx={{ px: 2, py: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {isEditing ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              <TextField label="Title" value={editedRow.title} size="small"
                onChange={(e) => onUpdate({ editedRow: { ...editedRow, title: e.target.value }, isDirty: true })} />
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Box sx={{ flex: 1 }}>
                  <TextField label="PMID" value={editedRow.pmid ?? ""} size="small"
                    onChange={(e) => onUpdate({ editedRow: { ...editedRow, pmid: e.target.value || undefined }, isDirty: true })} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField label="Authors" value={editedRow.authors ?? ""} size="small"
                    onChange={(e) => onUpdate({ editedRow: { ...editedRow, authors: e.target.value || undefined }, isDirty: true })} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField label="Journal" value={editedRow.journal ?? ""} size="small"
                    onChange={(e) => onUpdate({ editedRow: { ...editedRow, journal: e.target.value || undefined }, isDirty: true })} />
                </Box>
                <Box sx={{ width: 80 }}>
                  <TextField label="Year" value={editedRow.publicationYear?.toString() ?? ""} size="small"
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      onUpdate({ editedRow: { ...editedRow, publicationYear: isNaN(n) ? undefined : n }, isDirty: true });
                    }} />
                </Box>
              </Box>
            </Box>
          ) : (
            <>
              <Box sx={{ fontSize: "0.82rem", fontWeight: 600, color: c.text }}>{editedRow.title}</Box>
              {meta && <Box sx={{ fontSize: "0.73rem", color: c.overlay1, mt: 0.25 }}>{meta}</Box>}
              {isDirty && editedRow.pmid && (
                <Box sx={{ fontSize: "0.72rem", color: c.green, mt: 0.25 }}>PMID: {editedRow.pmid}</Box>
              )}
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          <Box
            component="button"
            onClick={() => onUpdate({ isEditing: !isEditing })}
            sx={{ fontSize: "0.7rem", color: c.blue, background: "none", border: "none", cursor: "pointer", padding: 0, "&:hover": { textDecoration: "underline" } }}
          >
            {isEditing ? "Done" : "Edit"}
          </Box>
          <Box sx={{ display: "inline-flex", border: `1px solid ${c.surface1}`, borderRadius: "3px", overflow: "hidden" }}>
            {([false, true] as const).map((skipVal, idx) => {
              const isActive = skip === skipVal;
              const label = skipVal ? "Skip" : "Import";
              return (
                <Box
                  key={label}
                  component="button"
                  onClick={() => onUpdate({ skip: skipVal, isEditing: false })}
                  sx={{
                    px: 1.25, py: 0.3, fontSize: "0.7rem", fontWeight: isActive ? 600 : 400,
                    backgroundColor: isActive ? (skipVal ? c.surface1 : c.blue) : "transparent",
                    color: isActive ? (skipVal ? c.text : "#ffffff") : c.overlay1,
                    border: "none", borderLeft: idx > 0 ? `1px solid ${c.surface1}` : "none",
                    cursor: "pointer", transition: "background-color 0.1s ease, color 0.1s ease",
                    "&:hover": !isActive ? { backgroundColor: c.surface0, color: c.text } : {},
                  }}
                >
                  {label}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ImportArticlesDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function ImportArticlesDialog({ open, onClose, projectId }: ImportArticlesDialogProps) {
  const utils = api.useUtils();
  const c = useThemeColors();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>("upload");
  const [parsed, setParsed] = useState<{ rows: ParsedRow[]; skipped: number } | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");

  const [firstCreated, setFirstCreated] = useState(0);
  const [autoSkipped, setAutoSkipped] = useState(0);
  const [staleCount, setStaleCount] = useState(0);
  const [entries, setEntries] = useState<ConflictEntry[]>([]);
  const [blankEntries, setBlankEntries] = useState<BlankPmidEntry[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  // Context captured at resolve-time for use in onSuccess
  const resolveContextRef = useRef<{ keepBothCount: number; skippedCount: number } | null>(null);

  const importMutation = api.article.import.useMutation({
    onSuccess: (result, variables) => {
      // First pass (no overwrites sent)
      if (!variables.overwrites) {
        if (result.conflicts.length === 0 && result.blankPmidRows.length === 0) {
          void utils.article.getByProject.invalidate({ projectId });
          void utils.project.getById.invalidate({ projectId });
          handleClose();
          return;
        }

        const { entries: newEntries, autoSkipped: skippedAuto } = buildEntries(
          result.conflicts as { incomingRow: ParsedRow; existing: ExistingArticle }[],
        );
        const newBlankEntries: BlankPmidEntry[] = (result.blankPmidRows as ParsedRow[]).map((row) => ({
          editedRow: { ...row }, isDirty: false, isEditing: false, skip: false,
        }));

        setFirstCreated(result.created);
        setAutoSkipped(skippedAuto);

        if (newEntries.length === 0 && newBlankEntries.length === 0) {
          void utils.article.getByProject.invalidate({ projectId });
          void utils.project.getById.invalidate({ projectId });
          handleClose();
          return;
        }

        setEntries(newEntries);
        setBlankEntries(newBlankEntries);
        setStaleCount(0);
        setPhase("resolving");
        return;
      }

      // Second pass (overwrites sent)
      if (result.staleConflicts.length > 0) {
        const { entries: staleEntries } = buildEntries(
          result.staleConflicts as { incomingRow: ParsedRow; existing: ExistingArticle }[],
        );
        setEntries(staleEntries);
        setBlankEntries([]);
        setStaleCount(result.staleConflicts.length);
        setPhase("resolving");
      } else {
        const ctx = resolveContextRef.current;
        setSummary({
          created: firstCreated,
          updated: result.updated,
          keptBoth: ctx?.keepBothCount ?? 0,
          skipped: ctx?.skippedCount ?? 0,
          autoSkipped,
        });
        setPhase("summary");
        void utils.article.getByProject.invalidate({ projectId });
        void utils.project.getById.invalidate({ projectId });
      }
    },
    onError: (err) => setParseError(err.message),
  });

  const handleClose = () => {
    setPhase("upload");
    setParsed(null);
    setFileName("");
    setParseError("");
    setFirstCreated(0);
    setAutoSkipped(0);
    setStaleCount(0);
    setEntries([]);
    setBlankEntries([]);
    setSummary(null);
    resolveContextRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  const handleFile = (file: File) => {
    setParseError("");
    setParsed(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const result = parseSheet(wb);
        if (result.rows.length === 0) {
          setParseError("No valid rows found. Make sure your file has a 'Title' column.");
          return;
        }
        setParsed(result);
      } catch {
        setParseError("Could not parse the file. Please use the sample template.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const updateEntry = (index: number, patch: Partial<ConflictEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const updateBlankEntry = (index: number, patch: Partial<BlankPmidEntry>) => {
    setBlankEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const handleResolve = () => {
    const overwriteEntries = entries.filter((e) => e.resolution === "overwrite");
    const keepBothEntries = entries.filter((e) => e.resolution === "keep_both");
    const skippedCount = entries.filter((e) => e.resolution === "skip").length;

    const overwrites = overwriteEntries.map((e) => ({
      articleId: e.existing.id,
      version: e.existing.version,
      data: getMergedRow(e),
    }));

    const rows: ParsedRow[] = [
      ...keepBothEntries.map((e) => getMergedRow(e)),
      ...blankEntries.filter((e) => !e.skip).map((e) => e.editedRow),
    ];

    resolveContextRef.current = { keepBothCount: keepBothEntries.length, skippedCount };

    if (overwrites.length === 0 && rows.length === 0) {
      setSummary({
        created: firstCreated,
        updated: 0,
        keptBoth: 0,
        skipped: skippedCount,
        autoSkipped,
      });
      setPhase("summary");
      return;
    }

    importMutation.mutate({ projectId, rows, overwrites });
  };

  // ── Upload phase ──────────────────────────────────────────────────────────

  if (phase === "upload") {
    const preview = parsed?.rows.slice(0, 5) ?? [];
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogHeader title="Import Articles" onClose={handleClose} />
        <DialogBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, px: 1, py: 0.5 }}>
            <Box sx={{ fontSize: "0.78rem", color: c.overlay1 }}>
              Upload a CSV or XLSX file.{" "}
              <Box component="a" href="/sample_article_import.xlsx" download
                sx={{ color: c.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                Download sample template
              </Box>
            </Box>

            <Box
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${c.surface1}`, borderRadius: "4px", py: 5,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                cursor: "pointer", transition: "border-color 0.15s ease",
                "&:hover": { borderColor: c.blue },
              }}
            >
              <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: c.subtext1 }}>
                {fileName ? fileName : "Click or drag & drop a file here"}
              </Box>
              <Box sx={{ fontSize: "0.75rem", color: c.overlay0 }}>Supports .xlsx and .csv</Box>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </Box>

            {parseError && <Box sx={{ fontSize: "0.8rem", color: c.red }}>{parseError}</Box>}

            {parsed && (
              <Box>
                <Box sx={{ fontSize: "0.8rem", color: c.overlay1, mb: 1.5 }}>
                  <Box component="span" sx={{ fontWeight: 600, color: c.green }}>
                    {parsed.rows.length} article{parsed.rows.length !== 1 ? "s" : ""} ready to import
                  </Box>
                  {parsed.skipped > 0 && (
                    <Box component="span" sx={{ color: c.yellow, ml: 1 }}>
                      · {parsed.skipped} row{parsed.skipped !== 1 ? "s" : ""} skipped (missing title)
                    </Box>
                  )}
                </Box>
                <Box sx={{ border: `1px solid ${c.surface0}`, backgroundColor: c.mantle, overflow: "hidden", fontSize: "0.75rem", borderRadius: "4px" }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", px: 2, py: 1, backgroundColor: c.surface0, color: c.overlay0, fontWeight: 600, letterSpacing: "0.06em", fontSize: "0.68rem", textTransform: "uppercase", gap: 2 }}>
                    <Box>Title</Box><Box>Authors</Box><Box>Journal</Box><Box>Year</Box>
                  </Box>
                  {preview.map((row, i) => (
                    <Box key={i} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", px: 2, py: 1.25, gap: 2, borderTop: `1px solid ${c.surface0}`, color: c.text }}>
                      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.title}</Box>
                      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: c.overlay1 }}>{row.authors ?? "—"}</Box>
                      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: c.overlay1 }}>{row.journal ?? "—"}</Box>
                      <Box sx={{ color: c.overlay1 }}>{row.publicationYear ?? "—"}</Box>
                    </Box>
                  ))}
                  {parsed.rows.length > 5 && (
                    <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${c.surface0}`, color: c.overlay0, fontSize: "0.72rem" }}>
                      … and {parsed.rows.length - 5} more
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 0.5 }}>
              <Button intent="ghost" onClick={handleClose} disabled={importMutation.isPending}>Cancel</Button>
              <Button
                intent="primary"
                onClick={() => parsed && importMutation.mutate({ projectId, rows: parsed.rows })}
                disabled={!parsed || importMutation.isPending}
              >
                {importMutation.isPending
                  ? <CircularProgress size={14} sx={{ color: "inherit" }} />
                  : parsed ? `Import ${parsed.rows.length} Article${parsed.rows.length !== 1 ? "s" : ""}` : "Import"}
              </Button>
            </Box>
          </Box>
        </DialogBody>
      </Dialog>
    );
  }

  // ── Summary phase ─────────────────────────────────────────────────────────

  if (phase === "summary" && summary) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm">
        <DialogHeader title="Import Complete" onClose={handleClose} />
        <DialogBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 1, py: 0.5 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {summary.created > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "0.82rem" }}>
                  <Box sx={{ color: c.green, fontWeight: 700, width: 14, textAlign: "center" }}>✓</Box>
                  <Box sx={{ color: c.text }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{summary.created}</Box>
                    {" "}new article{summary.created !== 1 ? "s" : ""} added
                  </Box>
                </Box>
              )}
              {summary.updated > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "0.82rem" }}>
                  <Box sx={{ color: c.blue, fontWeight: 700, width: 14, textAlign: "center" }}>↺</Box>
                  <Box sx={{ color: c.text }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{summary.updated}</Box>
                    {" "}article{summary.updated !== 1 ? "s" : ""} overwritten
                  </Box>
                </Box>
              )}
              {summary.keptBoth > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "0.82rem" }}>
                  <Box sx={{ color: c.mauve, fontWeight: 700, width: 14, textAlign: "center" }}>+</Box>
                  <Box sx={{ color: c.text }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{summary.keptBoth}</Box>
                    {" "}kept as additional entr{summary.keptBoth !== 1 ? "ies" : "y"}
                  </Box>
                </Box>
              )}
              {summary.skipped > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "0.82rem" }}>
                  <Box sx={{ color: c.overlay1, fontWeight: 700, width: 14, textAlign: "center" }}>⊘</Box>
                  <Box sx={{ color: c.overlay1 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{summary.skipped}</Box>
                    {" "}conflict{summary.skipped !== 1 ? "s" : ""} skipped
                  </Box>
                </Box>
              )}
              {summary.autoSkipped > 0 && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, fontSize: "0.82rem" }}>
                  <Box sx={{ color: c.overlay0, fontWeight: 700, width: 14, textAlign: "center" }}>↷</Box>
                  <Box sx={{ color: c.overlay0 }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>{summary.autoSkipped}</Box>
                    {" "}identical — auto-skipped
                  </Box>
                </Box>
              )}
              {summary.created === 0 && summary.updated === 0 && summary.keptBoth === 0 && (
                <Box sx={{ fontSize: "0.82rem", color: c.overlay1 }}>Nothing was imported.</Box>
              )}
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 0.5 }}>
              <Button intent="primary" onClick={handleClose}>Done</Button>
            </Box>
          </Box>
        </DialogBody>
      </Dialog>
    );
  }

  // ── Resolve phase ─────────────────────────────────────────────────────────

  const skipCount = entries.filter((e) => e.resolution === "skip").length;
  const overwriteCount = entries.filter((e) => e.resolution === "overwrite").length;
  const keepBothCount = entries.filter((e) => e.resolution === "keep_both").length;
  const blankImportCount = blankEntries.filter((e) => !e.skip).length;
  const actionCount = overwriteCount + keepBothCount + blankImportCount;

  const summaryParts = [
    skipCount > 0 && `${skipCount} skip`,
    overwriteCount > 0 && `${overwriteCount} overwrite`,
    keepBothCount > 0 && `${keepBothCount} keep all`,
  ].filter(Boolean).join(" · ");

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogHeader title="Resolve Conflicts" onClose={handleClose} />
      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 1, py: 0.5 }}>

          {staleCount > 0 && (
            <Box
              sx={{
                display: "flex", alignItems: "flex-start", gap: 1, p: 1.5,
                border: `1px solid ${c.yellow}44`, backgroundColor: `${c.yellow}0d`, borderRadius: "3px",
              }}
            >
              <WarningAmberOutlinedIcon sx={{ fontSize: "0.9rem", color: c.yellow, mt: "1px", flexShrink: 0 }} />
              <Box sx={{ fontSize: "0.78rem", color: c.text }}>
                {staleCount} article{staleCount !== 1 ? "s were" : " was"} modified by another user — please review the updated conflicts below.
              </Box>
            </Box>
          )}

          <Box sx={{ fontSize: "0.8rem", color: c.overlay1, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {firstCreated > 0 && (
              <Box sx={{ color: c.green }}>✓ {firstCreated} non-conflicting article{firstCreated !== 1 ? "s" : ""} already imported.</Box>
            )}
            {autoSkipped > 0 && (
              <Box>↷ {autoSkipped} identical row{autoSkipped !== 1 ? "s" : ""} auto-skipped.</Box>
            )}
          </Box>

          {entries.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ fontSize: "0.8rem", color: c.overlay1 }}>
                <Box component="span" sx={{ fontWeight: 600, color: c.yellow }}>
                  {entries.length} conflict{entries.length !== 1 ? "s" : ""}
                </Box>
                {summaryParts && <> — {summaryParts}</>}
              </Box>
            </Box>
          )}

          {entries.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 440, overflowY: "auto", pr: 0.5 }}>
              {entries.map((entry, i) => (
                <ConflictRow
                  key={i}
                  entry={entry}
                  onUpdate={(patch) => updateEntry(i, patch)}
                />
              ))}
            </Box>
          )}

          {blankEntries.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: c.overlay0 }}>
                No PMID — {blankEntries.length} row{blankEntries.length !== 1 ? "s" : ""}
                <Box component="span" sx={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, ml: 0.75, color: c.overlay1 }}>
                  (toggle to import or skip each)
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 300, overflowY: "auto", pr: 0.5 }}>
                {blankEntries.map((entry, i) => (
                  <BlankPmidRow key={i} entry={entry} onUpdate={(patch) => updateBlankEntry(i, patch)} />
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 0.5 }}>
            <Button intent="ghost" onClick={handleClose} disabled={importMutation.isPending}>Cancel</Button>
            <Button intent="primary" onClick={handleResolve} disabled={importMutation.isPending}>
              {importMutation.isPending
                ? <CircularProgress size={14} sx={{ color: "inherit" }} />
                : actionCount > 0
                  ? `Apply & Import ${actionCount} Article${actionCount !== 1 ? "s" : ""}`
                  : "Done (Skip All)"}
            </Button>
          </Box>
        </Box>
      </DialogBody>
    </Dialog>
  );
}
