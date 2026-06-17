"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { api } from "~/trpc/react";
import { TextField } from "~/app/_components/widgets/TextField";
import { Button } from "~/app/_components/widgets/Button";
import { AddMemberDialog } from "~/app/organization/[orgId]/_components/AddMemberDialog";
import { AddArticleDialog } from "./AddArticleDialog";
import { EditArticleDialog } from "./EditArticleDialog";
import { ImportArticlesDialog } from "./ImportArticlesDialog";
import { useStyles } from "../styles";
import { useDebounce } from "~/app/_hooks/useDebounce";

type ReviewStatusType = "PENDING" | "IN_REVIEW" | "REVIEWED" | "EXCLUDED";

const STATUS_OPTIONS: ReviewStatusType[] = ["PENDING", "IN_REVIEW", "REVIEWED", "EXCLUDED"];

const LIMIT = 20;

interface ArticleListProps {
  orgId: string;
  orgName: string;
  projectId: string;
  projectName: string;
  role: string;
  memberCount: number;
  articleCount: number;
}

export function ArticleList({
  orgId,
  orgName,
  projectId,
  projectName,
  role,
  memberCount,
  articleCount,
}: ArticleListProps) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState<ReviewStatusType | undefined>(undefined);
  const [addArticleOpen, setAddArticleOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<{
    id: string; title: string; authors: string | null; journal: string | null;
    publicationYear: number | null; pmid: string | null; doi: string | null;
  } | null>(null);
  const { styles, roleBadge, statusBadge, c } = useStyles();

  const utils = api.useUtils();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.article.getByProject.useInfiniteQuery(
      {
        projectId,
        limit: LIMIT,
        search: debouncedSearch || undefined,
        reviewStatus: statusFilter,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: undefined,
      },
    );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const updateStatus = api.article.updateStatus.useMutation({
    onMutate: async ({ articleId, reviewStatus }) => {
      const input = { projectId, limit: LIMIT, search: debouncedSearch || undefined, reviewStatus: statusFilter };
      await utils.article.getByProject.cancel(input);
      const prev = utils.article.getByProject.getInfiniteData(input);
      utils.article.getByProject.setInfiniteData(input, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map((a) =>
              a.id === articleId ? { ...a, reviewStatus } : a,
            ),
          })),
        };
      });
      return { prev, input };
    },
    onError: (_, __, ctx) => {
      if (ctx?.prev !== undefined) {
        utils.article.getByProject.setInfiniteData(ctx.input, ctx.prev);
      }
    },
    onSettled: () => {
      void utils.article.getByProject.invalidate({ projectId });
      void utils.project.getById.invalidate({ projectId });
    },
  });

  const deleteArticle = api.article.delete.useMutation({
    onSuccess: () => {
      void utils.article.getByProject.invalidate({ projectId });
      void utils.project.getById.invalidate({ projectId });
    },
  });

  const articles = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.pageHeader}>
        <Box>
          <Box sx={styles.breadcrumbs}>
            <Box
              component="span"
              sx={styles.breadcrumbLink}
              onClick={() => router.push("/organization")}
            >
              Organizations
            </Box>
            <Box component="span" sx={styles.breadcrumbSep}>/</Box>
            <Box
              component="span"
              sx={styles.breadcrumbLink}
              onClick={() => router.push(`/organization/${orgId}`)}
            >
              {orgName}
            </Box>
            <Box component="span" sx={styles.breadcrumbSep}>/</Box>
            <Box component="span" sx={{ color: c.subtext0 }}>{projectName}</Box>
          </Box>
          <Box sx={styles.pageEyebrow}>Project</Box>
          <Box sx={styles.pageTitle}>{projectName}</Box>
          <Box sx={styles.metaRow}>
            <Box sx={styles.metaItem}>
              <GroupOutlinedIcon sx={{ fontSize: "0.85rem" }} />
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </Box>
            <Box sx={styles.metaItem}>
              <ArticleOutlinedIcon sx={{ fontSize: "0.85rem" }} />
              {articleCount} {articleCount === 1 ? "article" : "articles"}
            </Box>
            <Box
              sx={{
                px: 0.75,
                py: 0.2,
                fontSize: "0.67rem",
                fontWeight: 600,
                letterSpacing: "0.05em",
                backgroundColor: roleBadge[role]?.bg,
                color: roleBadge[role]?.color,
                border: `1px solid ${roleBadge[role]?.border}`,
                borderRadius: "3px",
              }}
            >
              {role}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button intent="ghost" onClick={() => setMemberDialogOpen(true)} sx={{ gap: 0.5, fontSize: "0.82rem" }}>
            <PersonAddOutlinedIcon sx={{ fontSize: "0.95rem" }} />
            Add Member
          </Button>
          <Button intent="ghost" onClick={() => setImportOpen(true)} sx={{ gap: 0.5, fontSize: "0.82rem" }}>
            <FileUploadOutlinedIcon sx={{ fontSize: "0.95rem" }} />
            Import
          </Button>
          <Button intent="primary" onClick={() => setAddArticleOpen(true)} sx={{ gap: 0.5 }}>
            <AddIcon sx={{ fontSize: "1rem" }} />
            Add Article
          </Button>
        </Box>
      </Box>

      <Box sx={styles.toolbar}>
        <Box sx={styles.toolbarLeft}>
          <Box sx={styles.searchBox}>
            <TextField
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
            />
          </Box>
          <Box sx={styles.filterTabs}>
            <FilterTab
              label="All"
              active={statusFilter === undefined}
              c={c}
              onClick={() => setStatusFilter(undefined)}
            />
            {STATUS_OPTIONS.map((s) => (
              <FilterTab
                key={s}
                label={statusBadge[s]!.label}
                active={statusFilter === s}
                color={statusBadge[s]!.color}
                c={c}
                onClick={() => setStatusFilter(statusFilter === s ? undefined : s)}
              />
            ))}
          </Box>
        </Box>
        {!isLoading && (
          <Box sx={{ fontSize: "0.78rem", color: c.overlay0 }}>
            {articles.length} {articles.length === 1 ? "result" : "results"}
          </Box>
        )}
      </Box>

      <Box sx={styles.content}>
        {isLoading ? (
          <Box sx={styles.skeletonList}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" sx={styles.skeletonRow} />
            ))}
          </Box>
        ) : articles.length === 0 ? (
          <Box sx={styles.emptyState}>
            <ArticleOutlinedIcon sx={styles.emptyIcon} />
            <Box sx={styles.emptyTitle}>
              {debouncedSearch || statusFilter ? "No matching articles" : "No articles yet"}
            </Box>
            <Box sx={styles.emptyDesc}>
              {debouncedSearch || statusFilter
                ? "Try adjusting your search or filter."
                : "Add your first article to start reviewing."}
            </Box>
            {!debouncedSearch && !statusFilter && (
              <Button intent="primary" onClick={() => setAddArticleOpen(true)} sx={{ mt: 1.5 }}>
                Add Article
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={styles.list}>
            {articles.map((article) => {
              const meta = [article.authors, article.journal, article.publicationYear]
                .filter(Boolean)
                .join(" · ");
              const badge = statusBadge[article.reviewStatus];
              return (
                <Box key={article.id} sx={styles.row}>
                  <Box sx={styles.rowMain}>
                    <Box sx={styles.rowTitle}>{article.title}</Box>
                    {meta && <Box sx={styles.rowMeta}>{meta}</Box>}
                    {(article.pmid ?? article.doi) && (
                      <Box sx={styles.rowMeta}>
                        {article.pmid && <span>PMID: {article.pmid}</span>}
                        {article.pmid && article.doi && <span> · </span>}
                        {article.doi && <span>DOI: {article.doi}</span>}
                      </Box>
                    )}
                  </Box>

                  <Box sx={styles.rowRight}>
                    <Select
                      value={article.reviewStatus}
                      size="small"
                      onChange={(e) =>
                        updateStatus.mutate({
                          articleId: article.id,
                          reviewStatus: e.target.value as ReviewStatusType,
                        })
                      }
                      sx={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.04em",
                        height: 26,
                        color: badge?.color,
                        backgroundColor: badge?.bg,
                        border: `1px solid ${badge?.border}`,
                        borderRadius: "3px",
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiSelect-icon": { color: badge?.color, fontSize: "1rem" },
                        "& .MuiSelect-select": { py: 0, px: 1 },
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <MenuItem key={s} value={s} sx={{ fontSize: "0.78rem" }}>
                          {statusBadge[s]!.label}
                        </MenuItem>
                      ))}
                    </Select>

                    <IconButton
                      size="small"
                      onClick={() => setEditingArticle({
                        id: article.id,
                        title: article.title,
                        authors: article.authors ?? null,
                        journal: article.journal ?? null,
                        publicationYear: article.publicationYear ?? null,
                        pmid: article.pmid ?? null,
                        doi: article.doi ?? null,
                      })}
                      sx={{ color: c.overlay1, "&:hover": { color: c.blue } }}
                    >
                      <EditOutlinedIcon sx={{ fontSize: "0.95rem" }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => deleteArticle.mutate({ articleId: article.id })}
                      disabled={deleteArticle.isPending}
                      sx={{ color: c.overlay1, "&:hover": { color: c.red } }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: "0.95rem" }} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        <Box ref={sentinelRef} sx={styles.sentinel}>
          {isFetchingNextPage && <CircularProgress size={18} sx={{ color: c.blue }} />}
        </Box>
      </Box>

      <AddArticleDialog
        open={addArticleOpen}
        onClose={() => setAddArticleOpen(false)}
        projectId={projectId}
      />

      <EditArticleDialog
        open={editingArticle !== null}
        onClose={() => setEditingArticle(null)}
        article={editingArticle}
        projectId={projectId}
      />

      <ImportArticlesDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        projectId={projectId}
      />

      <AddMemberDialog
        open={memberDialogOpen}
        onClose={() => setMemberDialogOpen(false)}
        type="project"
        targetId={projectId}
        organizationId={orgId}
      />
    </Box>
  );
}

function FilterTab({
  label,
  active,
  color,
  c,
  onClick,
}: {
  label: string;
  active: boolean;
  color?: string;
  c: { blue: string; surface0: string; overlay1: string };
  onClick: () => void;
}) {
  return (
    <Box
      component="button"
      onClick={onClick}
      sx={{
        px: 1.25,
        py: 0.4,
        fontSize: "0.72rem",
        fontWeight: active ? 600 : 400,
        border: `1px solid ${active ? (color ?? c.blue) : c.surface0}`,
        backgroundColor: active ? `${color ?? c.blue}18` : "transparent",
        color: active ? (color ?? c.blue) : c.overlay1,
        cursor: "pointer",
        borderRadius: "3px",
        transition: "all 0.1s ease",
        "&:hover": {
          borderColor: color ?? c.blue,
          color: color ?? c.blue,
        },
      }}
    >
      {label}
    </Box>
  );
}
