"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { api } from "~/trpc/react";
import { Dialog, DialogHeader, DialogBody } from "~/app/_components/widgets/Dialog";
import { TextField } from "~/app/_components/widgets/TextField";
import { Button } from "~/app/_components/widgets/Button";
import { useDebounce } from "~/app/_hooks/useDebounce";
import { frappe } from "~/theme/colors";

type ConflictChoice = "add_anyway" | "overwrite";

interface AddArticleDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
}

export function AddArticleDialog({ open, onClose, projectId }: AddArticleDialogProps) {
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [pmid, setPmid] = useState("");
  const [doi, setDoi] = useState("");
  const [authors, setAuthors] = useState("");
  const [journal, setJournal] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [conflictChoice, setConflictChoice] = useState<ConflictChoice | null>(null);

  const debouncedPmid = useDebounce(pmid.trim(), 400);

  const { data: conflictData } = api.article.checkConflicts.useQuery(
    { projectId, pmids: [debouncedPmid] },
    { enabled: debouncedPmid.length > 0 },
  );
  const conflict = conflictData?.[0] ?? null;

  // Reset choice whenever the PMID changes
  const handlePmidChange = (val: string) => {
    setPmid(val);
    setConflictChoice(null);
  };

  const create = api.article.create.useMutation({
    onSuccess: () => {
      void utils.article.getByProject.invalidate({ projectId });
      void utils.project.getById.invalidate({ projectId });
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  const updateFields = api.article.updateFields.useMutation({
    onSuccess: () => {
      void utils.article.getByProject.invalidate({ projectId });
      void utils.project.getById.invalidate({ projectId });
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  const handleClose = () => {
    setTitle("");
    setPmid("");
    setDoi("");
    setAuthors("");
    setJournal("");
    setYear("");
    setError("");
    setConflictChoice(null);
    onClose();
  };

  const isPending = create.isPending || updateFields.isPending;

  const handleSubmit = () => {
    if (!title.trim()) { setError("Title is required."); return; }
    const parsedYear = year ? parseInt(year, 10) : undefined;
    if (year && (isNaN(parsedYear!) || parsedYear! < 1000 || parsedYear! > 9999)) {
      setError("Enter a valid 4-digit year."); return;
    }
    // Conflict exists and no choice made yet
    if (conflict && conflictChoice === null) {
      setError("Please choose how to handle the duplicate PMID."); return;
    }
    setError("");

    if (conflict && conflictChoice === "overwrite") {
      updateFields.mutate({
        articleId: conflict.id,
        title: title.trim(),
        pmid: pmid.trim() || undefined,
        doi: doi.trim() || undefined,
        authors: authors.trim() || undefined,
        journal: journal.trim() || undefined,
        publicationYear: parsedYear,
      });
    } else {
      create.mutate({
        projectId,
        title: title.trim(),
        pmid: pmid.trim() || undefined,
        doi: doi.trim() || undefined,
        authors: authors.trim() || undefined,
        journal: journal.trim() || undefined,
        publicationYear: parsedYear,
      });
    }
  };

  const conflictMeta = conflict
    ? [conflict.authors, conflict.journal, conflict.publicationYear].filter(Boolean).join(" · ")
    : null;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader title="Add Article" onClose={handleClose} />
      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 1, py: 0.5 }}>
          <TextField
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title"
            autoFocus
            size="small"
          />

          {/* PMID field + conflict callout */}
          <Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="PMID"
                  value={pmid}
                  onChange={(e) => handlePmidChange(e.target.value)}
                  placeholder="e.g. 12345678"
                  size="small"
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="DOI"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="e.g. 10.1000/xyz123"
                  size="small"
                />
              </Box>
            </Box>

            {/* Conflict callout */}
            {conflict && (
              <Box
                sx={{
                  mt: 1.25,
                  p: 1.5,
                  border: `1px solid ${frappe.yellow}44`,
                  backgroundColor: `${frappe.yellow}0d`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <WarningAmberOutlinedIcon sx={{ fontSize: "0.95rem", color: frappe.yellow, mt: "1px", flexShrink: 0 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ fontSize: "0.78rem", fontWeight: 600, color: frappe.yellow }}>
                      Already in project
                    </Box>
                    <Box sx={{ fontSize: "0.78rem", color: frappe.text, mt: 0.25 }}>{conflict.title}</Box>
                    {conflictMeta && (
                      <Box sx={{ fontSize: "0.72rem", color: frappe.overlay1, mt: 0.15 }}>{conflictMeta}</Box>
                    )}
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                      <Box
                        component="button"
                        onClick={() => setConflictChoice("add_anyway")}
                        sx={{
                          px: 1.25, py: 0.3, fontSize: "0.7rem", fontWeight: conflictChoice === "add_anyway" ? 700 : 400,
                          border: `1px solid ${conflictChoice === "add_anyway" ? frappe.blue : frappe.surface1}`,
                          backgroundColor: conflictChoice === "add_anyway" ? `${frappe.blue}22` : "transparent",
                          color: conflictChoice === "add_anyway" ? frappe.blue : frappe.overlay1,
                          cursor: "pointer",
                          "&:hover": { borderColor: frappe.blue, color: frappe.blue },
                        }}
                      >
                        Add Anyway
                      </Box>
                      <Box
                        component="button"
                        onClick={() => setConflictChoice("overwrite")}
                        sx={{
                          px: 1.25, py: 0.3, fontSize: "0.7rem", fontWeight: conflictChoice === "overwrite" ? 700 : 400,
                          border: `1px solid ${conflictChoice === "overwrite" ? frappe.peach : frappe.surface1}`,
                          backgroundColor: conflictChoice === "overwrite" ? `${frappe.peach}22` : "transparent",
                          color: conflictChoice === "overwrite" ? frappe.peach : frappe.overlay1,
                          cursor: "pointer",
                          "&:hover": { borderColor: frappe.peach, color: frappe.peach },
                        }}
                      >
                        Overwrite Existing
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          <TextField
            label="Authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            placeholder="e.g. Smith J, Doe A"
            size="small"
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                label="Journal"
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Journal name"
                size="small"
              />
            </Box>
            <Box sx={{ width: 100 }}>
              <TextField
                label="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                size="small"
              />
            </Box>
          </Box>

          {error && <Box sx={{ fontSize: "0.8rem", color: frappe.red }}>{error}</Box>}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 0.5 }}>
            <Button intent="ghost" onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button intent="primary" onClick={handleSubmit} disabled={isPending}>
              {isPending ? (
                <CircularProgress size={14} sx={{ color: "inherit" }} />
              ) : conflict && conflictChoice === "overwrite" ? (
                "Overwrite Existing"
              ) : (
                "Add Article"
              )}
            </Button>
          </Box>
        </Box>
      </DialogBody>
    </Dialog>
  );
}
