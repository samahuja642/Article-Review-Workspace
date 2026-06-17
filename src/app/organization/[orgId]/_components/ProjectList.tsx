"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import IconButton from "@mui/material/IconButton";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import AddIcon from "@mui/icons-material/Add";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import { api } from "~/trpc/react";
import { TextField } from "~/app/_components/widgets/TextField";
import { Button } from "~/app/_components/widgets/Button";
import { AddMemberDialog } from "./AddMemberDialog";
import { styles, roleBadge } from "../styles";
import { useDebounce } from "~/app/_hooks/useDebounce";
import { frappe } from "~/theme/colors";

const LIMIT = 20;

interface ProjectListProps {
  orgId: string;
  orgName: string;
  memberCount: number;
  projectCount: number;
  role: string;
}

export function ProjectList({ orgId, orgName, memberCount, projectCount, role }: ProjectListProps) {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"organization" | "project">("organization");
  const [dialogTargetId, setDialogTargetId] = useState(orgId);

  const openOrgDialog = () => {
    setDialogType("organization");
    setDialogTargetId(orgId);
    setDialogOpen(true);
  };

  const openProjectDialog = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setDialogType("project");
    setDialogTargetId(projectId);
    setDialogOpen(true);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.project.getAll.useInfiniteQuery(
      { organizationId: orgId, limit: LIMIT, search: debouncedSearch || undefined },
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

  const projects = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.pageHeader}>
        <Box>
          <Box
            component="a"
            href="/organization"
            sx={styles.breadcrumb}
            onClick={(e) => { e.preventDefault(); router.push("/organization"); }}
          >
            ← Organizations
          </Box>
          <Box sx={styles.pageEyebrow}>Organization</Box>
          <Box sx={styles.pageTitle}>{orgName}</Box>
          <Box sx={styles.metaRow}>
            <Box sx={styles.metaItem}>
              <GroupOutlinedIcon sx={{ fontSize: "0.85rem" }} />
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </Box>
            <Box sx={styles.metaItem}>
              <FolderOpenOutlinedIcon sx={{ fontSize: "0.85rem" }} />
              {projectCount} {projectCount === 1 ? "project" : "projects"}
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
              }}
            >
              {role}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Button intent="ghost" onClick={openOrgDialog} sx={{ gap: 0.5, fontSize: "0.82rem" }}>
            <PersonAddOutlinedIcon sx={{ fontSize: "0.95rem" }} />
            Add Member
          </Button>
          <Button
            intent="primary"
            onClick={() => router.push(`/organization/${orgId}/project/create`)}
            sx={{ gap: 0.5 }}
          >
            <AddIcon sx={{ fontSize: "1rem" }} />
            New Project
          </Button>
        </Box>
      </Box>

      <Box sx={styles.toolbar}>
        <Box sx={styles.searchBox}>
          <TextField
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Box>
        {!isLoading && (
          <Box sx={{ fontSize: "0.78rem", color: frappe.overlay0 }}>
            {projects.length} {projects.length === 1 ? "result" : "results"}
          </Box>
        )}
      </Box>

      <Box sx={styles.content}>
        {isLoading ? (
          <Box sx={styles.skeletonList}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" sx={styles.skeletonRow} />
            ))}
          </Box>
        ) : projects.length === 0 ? (
          <Box sx={styles.emptyState}>
            <FolderOpenOutlinedIcon sx={styles.emptyIcon} />
            <Box sx={styles.emptyTitle}>
              {debouncedSearch ? "No matching projects" : "No projects yet"}
            </Box>
            <Box sx={styles.emptyDesc}>
              {debouncedSearch ? "Try a different search term." : "Create your first project to start organizing articles."}
            </Box>
            {!debouncedSearch && (
              <Button
                intent="primary"
                onClick={() => router.push(`/organization/${orgId}/project/create`)}
                sx={{ mt: 1.5 }}
              >
                Create Project
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={styles.list}>
            {projects.map((project) => (
              <Box
                key={project.id}
                sx={styles.row}
                onClick={() => router.push(`/organization/${orgId}/project/${project.id}`)}
              >
                <Box sx={styles.rowInitial}>
                  {project.name.charAt(0).toUpperCase()}
                </Box>

                <Box sx={styles.rowMain}>
                  <Box sx={styles.rowName}>{project.name}</Box>
                  <Box
                    sx={{
                      display: "inline-flex",
                      px: 0.75,
                      py: 0.2,
                      fontSize: "0.67rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                      backgroundColor: roleBadge[project.role ?? "MEMBER"]?.bg,
                      color: roleBadge[project.role ?? "MEMBER"]?.color,
                      border: `1px solid ${roleBadge[project.role ?? "MEMBER"]?.border}`,
                    }}
                  >
                    {project.role}
                  </Box>
                </Box>

                <Box sx={styles.rowRight}>
                  <Box sx={styles.rowStat}>
                    <GroupOutlinedIcon sx={{ fontSize: "0.8rem" }} />
                    {project.memberCount} {project.memberCount === 1 ? "member" : "members"}
                  </Box>
                  <Box sx={styles.rowStat}>
                    <ArticleOutlinedIcon sx={{ fontSize: "0.8rem" }} />
                    {project.articleCount} {project.articleCount === 1 ? "article" : "articles"}
                  </Box>
                  <Box sx={styles.rowDate}>
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => openProjectDialog(e, project.id)}
                    sx={{ color: frappe.overlay1, "&:hover": { color: frappe.blue }, ml: 0.5 }}
                  >
                    <PersonAddOutlinedIcon sx={{ fontSize: "0.95rem" }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box ref={sentinelRef} sx={styles.sentinel}>
          {isFetchingNextPage && <CircularProgress size={18} sx={{ color: frappe.blue }} />}
        </Box>
      </Box>

      <AddMemberDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        type={dialogType}
        targetId={dialogTargetId}
        organizationId={orgId}
      />
    </Box>
  );
}
