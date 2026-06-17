"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { api } from "~/trpc/react";
import { Dialog, DialogHeader, DialogBody } from "~/app/_components/widgets/Dialog";
import { TextField } from "~/app/_components/widgets/TextField";
import { Button } from "~/app/_components/widgets/Button";
import { useDebounce } from "~/app/_hooks/useDebounce";
import { useThemeColors } from "~/theme/useThemeColors";

interface ArticleFields {
  id: string;
  title: string;
  authors: string | null;
  journal: string | null;
  publicationYear: number | null;
  pmid: string | null;
  doi: string | null;
}

interface EditArticleDialogProps {
  open: boolean;
  onClose: () => void;
  article: ArticleFields | null;
  projectId: string;
}

export function EditArticleDialog({ open, onClose, article, projectId }: EditArticleDialogProps) {
  const c = useThemeColors();
  const utils = api.useUtils();

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [journal, setJournal] = useState("");
  const [year, setYear] = useState("");
  const [pmid, setPmid] = useState("");
  const [doi, setDoi] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setAuthors(article.authors ?? "");
      setJournal(article.journal ?? "");
      setYear(article.publicationYear?.toString() ?? "");
      setPmid(article.pmid ?? "");
      setDoi(article.doi ?? "");
      setError("");
    }
  }, [article]);

  // Debounced conflict check — only fires when PMID changes and differs from original
  const debouncedPmid = useDebounce(pmid.trim(), 400);
  const originalPmid = article?.pmid ?? "";
  const pmidChanged = debouncedPmid !== originalPmid;

  const { data: conflictData } = api.article.checkConflicts.useQuery(
    { projectId, pmids: [debouncedPmid] },
    { enabled: debouncedPmid.length > 0 && pmidChanged },
  );
  // Exclude self — the current article's own PMID isn't a conflict
  const conflict = conflictData?.find((c) => c.id !== article?.id) ?? null;

  const updateFields = api.article.updateFields.useMutation({
    onSuccess: () => {
      void utils.article.getByProject.invalidate({ projectId });
      handleClose();
    },
    onError: (err) => setError(err.message),
  });

  const handleClose = () => {
    setError("");
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) { setError("Title is required."); return; }
    const parsedYear = year ? parseInt(year, 10) : undefined;
    if (year && (isNaN(parsedYear!) || parsedYear! < 1000 || parsedYear! > 9999)) {
      setError("Enter a valid 4-digit year."); return;
    }
    setError("");
    updateFields.mutate({
      articleId: article!.id,
      title: title.trim(),
      authors: authors.trim() || undefined,
      journal: journal.trim() || undefined,
      publicationYear: parsedYear,
      pmid: pmid.trim() || undefined,
      doi: doi.trim() || undefined,
    });
  };

  const conflictMeta = conflict
    ? [conflict.authors, conflict.journal, conflict.publicationYear].filter(Boolean).join(" · ")
    : null;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogHeader title="Edit Article" onClose={handleClose} />
      <DialogBody>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 1, py: 0.5 }}>
          <TextField
            label="Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            size="small"
          />

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

          <Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  label="PMID"
                  value={pmid}
                  onChange={(e) => setPmid(e.target.value)}
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

            {conflict && (
              <Box
                sx={{
                  mt: 1.25, p: 1.5,
                  border: `1px solid ${c.yellow}44`,
                  backgroundColor: `${c.yellow}0d`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                  <WarningAmberOutlinedIcon sx={{ fontSize: "0.95rem", color: c.yellow, mt: "1px", flexShrink: 0 }} />
                  <Box>
                    <Box sx={{ fontSize: "0.78rem", fontWeight: 600, color: c.yellow }}>
                      PMID already used by another article
                    </Box>
                    <Box sx={{ fontSize: "0.78rem", color: c.text, mt: 0.25 }}>{conflict.title}</Box>
                    {conflictMeta && (
                      <Box sx={{ fontSize: "0.72rem", color: c.overlay1, mt: 0.15 }}>{conflictMeta}</Box>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </Box>

          {error && <Box sx={{ fontSize: "0.8rem", color: c.red }}>{error}</Box>}

          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, pt: 0.5 }}>
            <Button intent="ghost" onClick={handleClose} disabled={updateFields.isPending}>
              Cancel
            </Button>
            <Button intent="primary" onClick={handleSubmit} disabled={updateFields.isPending}>
              {updateFields.isPending ? (
                <CircularProgress size={14} sx={{ color: "inherit" }} />
              ) : (
                "Save Changes"
              )}
            </Button>
          </Box>
        </Box>
      </DialogBody>
    </Dialog>
  );
}
