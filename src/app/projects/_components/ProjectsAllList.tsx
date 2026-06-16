"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import { api } from "~/trpc/react";
import { TextField } from "~/app/_components/widgets/TextField";
import { styles, roleBadge } from "../styles";
import { useDebounce } from "~/app/_hooks/useDebounce";
import { frappe } from "~/theme/colors";

const LIMIT = 20;

export function ProjectsAllList() {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.project.getAllProjectsByUserAndOrganization.useInfiniteQuery(
      { limit: LIMIT, search: debouncedSearch || undefined },
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
        <Box sx={styles.pageHeaderLeft}>
          <Box sx={styles.pageEyebrow}>Workspace</Box>
          <Box sx={styles.pageTitle}>Projects</Box>
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
            {Array.from({ length: 6 }).map((_, i) => (
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
              {debouncedSearch
                ? "Try a different search term."
                : "Join or create a project inside an organization."}
            </Box>
          </Box>
        ) : (
          <Box sx={styles.list}>
            {projects.map((project) => (
              <Box
                key={project.id}
                sx={styles.row}
                onClick={() =>
                  router.push(`/organization/${project.organizationId}/project/${project.id}`)
                }
              >
                <Box sx={styles.rowInitial}>
                  {project.name.charAt(0).toUpperCase()}
                </Box>

                <Box sx={styles.rowMain}>
                  <Box sx={styles.rowName}>{project.name}</Box>
                  <Box sx={styles.rowOrg}>{project.organizationName}</Box>
                </Box>

                <Box sx={styles.rowRight}>
                  <Box
                    sx={{
                      px: 0.75,
                      py: 0.2,
                      fontSize: "0.67rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      backgroundColor: roleBadge[project.role]?.bg,
                      color: roleBadge[project.role]?.color,
                      border: `1px solid ${roleBadge[project.role]?.border}`,
                    }}
                  >
                    {project.role}
                  </Box>
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
                </Box>
              </Box>
            ))}
          </Box>
        )}

        <Box ref={sentinelRef} sx={styles.sentinel}>
          {isFetchingNextPage && <CircularProgress size={18} sx={{ color: frappe.blue }} />}
        </Box>
      </Box>
    </Box>
  );
}
