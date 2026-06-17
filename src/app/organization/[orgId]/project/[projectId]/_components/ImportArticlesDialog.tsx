"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import * as XLSX from "xlsx";
import { api } from "~/trpc/react";
import { Dialog, DialogHeader, DialogBody } from "~/app/_components/widgets/Dialog";
import { Button } from "~/app/_components/widgets/Button";
import { TextField } from "~/app/_components/widgets/TextField";
import { frappe } from "~/theme/colors";

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

interface ExistingArticle {
  id: string;
  pmid: string | null;
  title: string;
  authors: string | null;
  journal: string | null;
  publicationYear: number | null;
}

interface BlankPmidEntry {
  editedRow: ParsedRow;
  isDirty: boolean;
  isEditing: boolean;
  skip: boolean;
}

interface ConflictEntry {
  // all incoming rows that share this PMID (grouped)
  incomingRows: ParsedRow[];
  existing: ExistingArticle;
  // mutable resolution state (stored inline to stay in sync)
  resolution: Resolution;
  // which incoming row is selected as the overwrite source (default 0)
  selectedRowIndex: number;
  // editedRow = editable version of the selected row (used for "overwrite")
  editedRow: ParsedRow;
  isDirty: boolean;
  isEditing: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function norm(v: string | number | null | undefined) {
  return String(v ?? "").trim().toLowerCase();
}

function isIdentical(row: ParsedRow, existing: ExistingArticle) {
  return (
    norm(row.title) === norm(existing.title) &&
    norm(row.authors) === norm(existing.authors) &&
    norm(row.journal) === norm(existing.journal) &&
    norm(row.publicationYear) === norm(existing.publicationYear)
  );
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResolutionToggle({
  value,
  onChange,
}: {
  value: Resolution;
  onChange: (r: Resolution) => void;
}) {
  const options: { key: Resolution; label: string }[] = [
    { key: "skip", label: "Skip" },
    { key: "overwrite", label: "Overwrite" },
    { key: "keep_both", label: "Keep Both" },
  ];
  return (
    <Box sx={{ display: "flex", gap: 0.75 }}>
      {options.map((opt) => (
        <Box
          key={opt.key}
          component="button"
          onClick={() => onChange(opt.key)}
          sx={{
            px: 1.25, py: 0.3,
            fontSize: "0.7rem",
            fontWeight: value === opt.key ? 700 : 400,
            border: `1px solid ${value === opt.key ? frappe.blue : frappe.surface1}`,
            backgroundColor: value === opt.key ? `${frappe.blue}22` : "transparent",
            color: value === opt.key ? frappe.blue : frappe.overlay1,
            cursor: "pointer",
            transition: "all 0.1s",
            "&:hover": { borderColor: frappe.blue, color: frappe.blue },
          }}
        >
          {opt.label}
        </Box>
      ))}
    </Box>
  );
}

function ConflictRow({
  entry,
  onUpdate,
}: {
  entry: ConflictEntry;
  onUpdate: (patch: Partial<ConflictEntry>) => void;
}) {
  const { existing, resolution, editedRow, isDirty, isEditing, incomingRows, selectedRowIndex } = entry;

  const existingMeta = [existing.authors, existing.journal, existing.publicationYear]
    .filter(Boolean).join(" · ");

  const selectRow = (idx: number) => {
    if (idx === selectedRowIndex) return;
    onUpdate({ selectedRowIndex: idx, editedRow: { ...incomingRows[idx]! }, isDirty: false, isEditing: false });
  };

  return (
    <Box sx={{ border: `1px solid ${frappe.surface0}`, backgroundColor: frappe.mantle, overflow: "hidden", flexShrink: 0 }}>
      {/* Header: PMID + resolution toggle */}
      <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, backgroundColor: frappe.surface0 }}>
        <Box sx={{ fontSize: "0.72rem", fontWeight: 600, color: frappe.overlay1 }}>
          PMID: <Box component="span" sx={{ color: frappe.text }}>{incomingRows[0]!.pmid ?? "—"}</Box>
        </Box>
        <ResolutionToggle value={resolution} onChange={(r) => onUpdate({ resolution: r })} />
      </Box>

      {/* Existing article */}
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${frappe.surface0}` }}>
        <Box sx={{ fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: frappe.overlay0, mb: 0.5 }}>
          Existing (in project)
        </Box>
        <Box sx={{ fontSize: "0.82rem", fontWeight: 600, color: frappe.text }}>{existing.title}</Box>
        {existingMeta && <Box sx={{ fontSize: "0.73rem", color: frappe.overlay1, mt: 0.25 }}>{existingMeta}</Box>}
      </Box>

      {/* Incoming rows — each selectable as the overwrite source */}
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Box sx={{ fontSize: "0.67rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: frappe.overlay0, mb: 1 }}>
          Incoming (from file)
          {incomingRows.length > 1 && (
            <Box component="span" sx={{ color: frappe.overlay1, ml: 0.75, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              · {incomingRows.length} entries{resolution === "overwrite" ? " — click to select which to use" : ""}
            </Box>
          )}
          {isDirty && <Box component="span" sx={{ color: frappe.yellow, ml: 0.75 }}>• edited</Box>}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 1 }}>
          {incomingRows.map((row, idx) => {
            const isSelected = idx === selectedRowIndex;
            const displayRow = isSelected ? editedRow : row;
            const meta = [displayRow.authors, displayRow.journal, displayRow.publicationYear].filter(Boolean).join(" · ");
            return (
              <Box
                key={idx}
                onClick={() => selectRow(idx)}
                sx={{
                  px: 1.5, py: 1,
                  border: `1px solid ${isSelected ? frappe.blue : frappe.surface1}`,
                  backgroundColor: isSelected ? `${frappe.blue}0d` : "transparent",
                  cursor: incomingRows.length > 1 && !isSelected ? "pointer" : "default",
                  "&:hover": incomingRows.length > 1 && !isSelected ? { borderColor: frappe.overlay0 } : {},
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    {isSelected && isEditing ? (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        <TextField label="Title" value={editedRow.title} size="small"
                          onChange={(e) => onUpdate({ editedRow: { ...editedRow, title: e.target.value }, isDirty: true })} />
                        <Box sx={{ display: "flex", gap: 1.5 }}>
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
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                          <Box sx={{ flex: 1 }}>
                            <TextField label="DOI" value={editedRow.doi ?? ""} size="small"
                              onChange={(e) => onUpdate({ editedRow: { ...editedRow, doi: e.target.value || undefined }, isDirty: true })} />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <TextField label="PMID" value={editedRow.pmid ?? ""} size="small"
                              onChange={(e) => onUpdate({ editedRow: { ...editedRow, pmid: e.target.value || undefined }, isDirty: true })} />
                          </Box>
                        </Box>
                      </Box>
                    ) : (
                      <>
                        <Box sx={{ fontSize: "0.82rem", fontWeight: 600, color: frappe.text }}>{displayRow.title}</Box>
                        {meta && <Box sx={{ fontSize: "0.73rem", color: frappe.overlay1, mt: 0.25 }}>{meta}</Box>}
                      </>
                    )}
                  </Box>
                  {isSelected && (
                    <Box
                      component="button"
                      onClick={(e) => { e.stopPropagation(); onUpdate({ isEditing: !isEditing }); }}
                      sx={{ fontSize: "0.7rem", color: frappe.blue, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0, "&:hover": { textDecoration: "underline" } }}
                    >
                      {isEditing ? "Done" : "Edit"}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

function BlankPmidRow({
  entry,
  onUpdate,
}: {
  entry: BlankPmidEntry;
  onUpdate: (patch: Partial<BlankPmidEntry>) => void;
}) {
  const { editedRow, isDirty, isEditing, skip } = entry;
  const meta = [editedRow.authors, editedRow.journal, editedRow.publicationYear].filter(Boolean).join(" · ");

  return (
    <Box sx={{ border: `1px solid ${skip ? frappe.surface0 : frappe.surface1}`, backgroundColor: skip ? "transparent" : frappe.mantle, flexShrink: 0, opacity: skip ? 0.5 : 1 }}>
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
              <Box sx={{ fontSize: "0.82rem", fontWeight: 600, color: frappe.text }}>{editedRow.title}</Box>
              {meta && <Box sx={{ fontSize: "0.73rem", color: frappe.overlay1, mt: 0.25 }}>{meta}</Box>}
              {isDirty && editedRow.pmid && (
                <Box sx={{ fontSize: "0.72rem", color: frappe.green, mt: 0.25 }}>PMID: {editedRow.pmid}</Box>
              )}
            </>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexShrink: 0 }}>
          <Box
            component="button"
            onClick={() => onUpdate({ isEditing: !isEditing })}
            sx={{ fontSize: "0.7rem", color: frappe.blue, background: "none", border: "none", cursor: "pointer", padding: 0, "&:hover": { textDecoration: "underline" } }}
          >
            {isEditing ? "Done" : "Edit"}
          </Box>
          <Box
            component="button"
            onClick={() => onUpdate({ skip: !skip, isEditing: false })}
            sx={{
              px: 1.25, py: 0.3, fontSize: "0.7rem", fontWeight: 600,
              border: `1px solid ${skip ? frappe.surface1 : frappe.red}`,
              backgroundColor: skip ? "transparent" : `${frappe.red}22`,
              color: skip ? frappe.overlay1 : frappe.red,
              cursor: "pointer",
              "&:hover": { borderColor: skip ? frappe.overlay0 : frappe.red },
            }}
          >
            {skip ? "Import" : "Skip"}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = "upload" | "resolving";

interface ImportArticlesDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function ImportArticlesDialog({ open, onClose, projectId }: ImportArticlesDialogProps) {
  const utils = api.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload phase
  const [phase, setPhase] = useState<Phase>("upload");
  const [parsed, setParsed] = useState<{ rows: ParsedRow[]; skipped: number } | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");

  // Resolve phase — single unified array keeps conflicts + state in sync
  const [firstCreated, setFirstCreated] = useState(0);
  const [autoSkipped, setAutoSkipped] = useState(0);
  const [entries, setEntries] = useState<ConflictEntry[]>([]);
  const [blankEntries, setBlankEntries] = useState<BlankPmidEntry[]>([]);

  const importMutation = api.article.import.useMutation({
    onSuccess: (result) => {
      // Second-pass result (no conflicts, no blank rows) — done
      if (result.conflicts.length === 0 && result.blankPmidRows.length === 0) {
        void utils.article.getByProject.invalidate({ projectId });
        void utils.project.getById.invalidate({ projectId });
        const msg = result.updated > 0
          ? `Imported ${result.created} new + updated ${result.updated} existing articles.`
          : `Successfully imported ${result.created} article${result.created !== 1 ? "s" : ""}.`;
        handleClose();
        alert(msg);
        return;
      }

      // Group conflicts by PMID so duplicate-PMID rows share one handler
      const grouped = new Map<string, { incomingRows: ParsedRow[]; existing: ExistingArticle }>();
      for (const c of result.conflicts) {
        const pmid = (c.incomingRow as ParsedRow).pmid ?? "__no_pmid__";
        if (!grouped.has(pmid)) {
          grouped.set(pmid, { incomingRows: [], existing: c.existing as ExistingArticle });
        }
        grouped.get(pmid)!.incomingRows.push(c.incomingRow as ParsedRow);
      }

      // Auto-skip groups where every incoming row is identical to the existing article
      let autoSkippedCount = 0;
      const newEntries: ConflictEntry[] = [];
      for (const { incomingRows, existing } of grouped.values()) {
        if (incomingRows.every((r) => isIdentical(r, existing))) {
          autoSkippedCount += incomingRows.length;
          continue;
        }
        newEntries.push({
          incomingRows,
          existing,
          resolution: "skip" as Resolution,
          selectedRowIndex: 0,
          editedRow: { ...incomingRows[0]! },
          isDirty: false,
          isEditing: false,
        });
      }

      const newBlankEntries: BlankPmidEntry[] = (result.blankPmidRows as ParsedRow[]).map((row) => ({
        editedRow: { ...row },
        isDirty: false,
        isEditing: false,
        skip: false,
      }));

      setFirstCreated(result.created);
      setAutoSkipped(autoSkippedCount);

      // If nothing needs user input, close immediately
      if (newEntries.length === 0 && newBlankEntries.length === 0) {
        void utils.article.getByProject.invalidate({ projectId });
        void utils.project.getById.invalidate({ projectId });
        handleClose();
        const skippedNote = autoSkippedCount > 0 ? ` ${autoSkippedCount} identical skipped.` : "";
        alert(`Successfully imported ${result.created} article${result.created !== 1 ? "s" : ""}.${skippedNote}`);
        return;
      }

      setEntries(newEntries);
      setBlankEntries(newBlankEntries);
      setPhase("resolving");
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
    setEntries([]);
    setBlankEntries([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  // ── Upload phase ──────────────────────────────────────────────────────────

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

  // ── Resolve phase ─────────────────────────────────────────────────────────

  const updateEntry = (index: number, patch: Partial<ConflictEntry>) => {
    setEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const anyDirty = entries.some((e) => e.isDirty);

  const resetAllEdits = () => {
    setEntries((prev) =>
      prev.map((e) => ({ ...e, selectedRowIndex: 0, editedRow: { ...e.incomingRows[0]! }, isDirty: false, isEditing: false })),
    );
  };

  const updateBlankEntry = (index: number, patch: Partial<BlankPmidEntry>) => {
    setBlankEntries((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const handleResolve = () => {
    const overwrites: { articleId: string; data: ParsedRow }[] = [];
    const rows: ParsedRow[] = [];
    let skipped = 0;

    for (const e of entries) {
      if (e.resolution === "overwrite") {
        overwrites.push({ articleId: e.existing.id, data: e.editedRow });
      } else if (e.resolution === "keep_both") {
        rows.push(...e.incomingRows);
      } else {
        skipped++;
      }
    }

    // Include non-skipped blank-PMID rows
    for (const e of blankEntries) {
      if (!e.skip) rows.push(e.editedRow);
    }

    if (overwrites.length === 0 && rows.length === 0) {
      void utils.article.getByProject.invalidate({ projectId });
      void utils.project.getById.invalidate({ projectId });
      handleClose();
      alert(`Imported ${firstCreated} article${firstCreated !== 1 ? "s" : ""}. ${skipped} conflict${skipped !== 1 ? "s" : ""} skipped.`);
      return;
    }

    importMutation.mutate({ projectId, rows, overwrites });
  };

  // ── Render: upload phase ──────────────────────────────────────────────────

  if (phase === "upload") {
    const preview = parsed?.rows.slice(0, 5) ?? [];
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogHeader title="Import Articles" onClose={handleClose} />
        <DialogBody>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, px: 1, py: 0.5 }}>
            <Box sx={{ fontSize: "0.78rem", color: frappe.overlay1 }}>
              Upload a CSV or XLSX file.{" "}
              <Box component="a" href="/sample_article_import.xlsx" download
                sx={{ color: frappe.blue, textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                Download sample template
              </Box>
            </Box>

            <Box
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${frappe.surface1}`, borderRadius: 1, py: 5,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                cursor: "pointer", transition: "border-color 0.15s",
                "&:hover": { borderColor: frappe.blue },
              }}
            >
              <Box sx={{ fontSize: "0.875rem", fontWeight: 600, color: frappe.subtext1 }}>
                {fileName ? fileName : "Click or drag & drop a file here"}
              </Box>
              <Box sx={{ fontSize: "0.75rem", color: frappe.overlay0 }}>Supports .xlsx and .csv</Box>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
            </Box>

            {parseError && <Box sx={{ fontSize: "0.8rem", color: frappe.red }}>{parseError}</Box>}

            {parsed && (
              <Box>
                <Box sx={{ fontSize: "0.8rem", color: frappe.overlay1, mb: 1.5 }}>
                  <Box component="span" sx={{ fontWeight: 600, color: frappe.green }}>
                    {parsed.rows.length} article{parsed.rows.length !== 1 ? "s" : ""} ready to import
                  </Box>
                  {parsed.skipped > 0 && (
                    <Box component="span" sx={{ color: frappe.yellow, ml: 1 }}>
                      · {parsed.skipped} row{parsed.skipped !== 1 ? "s" : ""} skipped (missing title)
                    </Box>
                  )}
                </Box>
                <Box sx={{ border: `1px solid ${frappe.surface0}`, backgroundColor: frappe.mantle, overflow: "hidden", fontSize: "0.75rem" }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", px: 2, py: 1, backgroundColor: frappe.surface0, color: frappe.overlay0, fontWeight: 600, letterSpacing: "0.06em", fontSize: "0.68rem", textTransform: "uppercase", gap: 2 }}>
                    <Box>Title</Box><Box>Authors</Box><Box>Journal</Box><Box>Year</Box>
                  </Box>
                  {preview.map((row, i) => (
                    <Box key={i} sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", px: 2, py: 1.25, gap: 2, borderTop: `1px solid ${frappe.surface0}`, color: frappe.text }}>
                      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.title}</Box>
                      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: frappe.overlay1 }}>{row.authors ?? "—"}</Box>
                      <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: frappe.overlay1 }}>{row.journal ?? "—"}</Box>
                      <Box sx={{ color: frappe.overlay1 }}>{row.publicationYear ?? "—"}</Box>
                    </Box>
                  ))}
                  {parsed.rows.length > 5 && (
                    <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${frappe.surface0}`, color: frappe.overlay0, fontSize: "0.72rem" }}>
                      … and {parsed.rows.length - 5} more
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 0.5 }}>
              <Button intent="ghost" onClick={handleClose} disabled={importMutation.isPending}>Cancel</Button>
              <Button intent="primary" onClick={() => parsed && importMutation.mutate({ projectId, rows: parsed.rows })} disabled={!parsed || importMutation.isPending}>
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

  // ── Render: resolve phase ─────────────────────────────────────────────────

  const skipCount = entries.filter((e) => e.resolution === "skip").length;
  const overwriteCount = entries.filter((e) => e.resolution === "overwrite").length;
  const keepBothCount = entries.filter((e) => e.resolution === "keep_both").length;
  const blankImportCount = blankEntries.filter((e) => !e.skip).length;
  const actionCount = overwriteCount + keepBothCount + blankImportCount;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogHeader title="Resolve Conflicts" onClose={handleClose} />
      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 1, py: 0.5 }}>
          <Box sx={{ fontSize: "0.8rem", color: frappe.overlay1, display: "flex", flexDirection: "column", gap: 0.5 }}>
            {firstCreated > 0 && (
              <Box sx={{ color: frappe.green }}>✓ {firstCreated} non-conflicting article{firstCreated !== 1 ? "s" : ""} already imported.</Box>
            )}
            {autoSkipped > 0 && (
              <Box sx={{ color: frappe.overlay1 }}>↷ {autoSkipped} identical row{autoSkipped !== 1 ? "s" : ""} auto-skipped.</Box>
            )}
          </Box>

          {/* Toolbar — only shown when there are actual conflicts */}
          {entries.length > 0 && <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box sx={{ fontSize: "0.8rem", color: frappe.overlay1 }}>
              <Box component="span" sx={{ fontWeight: 600, color: frappe.yellow }}>
                {entries.length} conflict{entries.length !== 1 ? "s" : ""} found
              </Box>
              {" — "}
              {skipCount > 0 && `${skipCount} skip · `}
              {overwriteCount > 0 && `${overwriteCount} overwrite · `}
              {keepBothCount > 0 && `${keepBothCount} keep both · `}
            </Box>
            {anyDirty && (
              <Box component="button" onClick={resetAllEdits}
                sx={{ fontSize: "0.72rem", color: frappe.overlay1, background: "none", border: `1px solid ${frappe.surface1}`, px: 1, py: 0.4, cursor: "pointer", "&:hover": { color: frappe.text, borderColor: frappe.overlay0 } }}>
                Reset All Edits ↺
              </Box>
            )}
          </Box>}

          {/* Conflict list */}
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

          {/* Blank-PMID rows */}
          {blankEntries.length > 0 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: frappe.overlay0 }}>
                No PMID — {blankEntries.length} row{blankEntries.length !== 1 ? "s" : ""}
                <Box component="span" sx={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, ml: 0.75, color: frappe.overlay1 }}>
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
