"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AddIcon from "@mui/icons-material/Add";
import { api } from "~/trpc/react";
import { TextField } from "~/app/_components/widgets/TextField";
import { Button } from "~/app/_components/widgets/Button";
import { styles, roleBadge } from "../styles";
import { useDebounce } from "~/app/_hooks/useDebounce";
import { frappe } from "~/theme/colors";

const LIMIT = 20;

export function OrganizationList() {
  const router = useRouter();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    api.organization.getAll.useInfiniteQuery(
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

  const organizations = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <Box sx={styles.page}>
      {/* Page header */}
      <Box sx={styles.pageHeader}>
        <Box sx={styles.pageHeaderLeft}>
          <Box sx={styles.pageEyebrow}>Workspace</Box>
          <Box sx={styles.pageTitle}>Organizations</Box>
        </Box>
        <Button
          intent="primary"
          onClick={() => router.push("/organization/create")}
          sx={{ gap: 0.5 }}
        >
          <AddIcon sx={{ fontSize: "1rem" }} />
          New Organization
        </Button>
      </Box>

      {/* Toolbar */}
      <Box sx={styles.toolbar}>
        <Box sx={styles.searchBox}>
          <TextField
            placeholder="Search organizations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
          />
        </Box>
        {!isLoading && (
          <Box sx={{ fontSize: "0.78rem", color: frappe.overlay0 }}>
            {organizations.length} {organizations.length === 1 ? "result" : "results"}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box sx={styles.content}>
        {isLoading ? (
          <Box sx={styles.skeletonList}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" sx={styles.skeletonRow} />
            ))}
          </Box>
        ) : organizations.length === 0 ? (
          <Box sx={styles.emptyState}>
            <BusinessOutlinedIcon sx={styles.emptyIcon} />
            <Box sx={styles.emptyTitle}>
              {debouncedSearch ? "No matching organizations" : "No organizations yet"}
            </Box>
            <Box sx={styles.emptyDesc}>
              {debouncedSearch
                ? "Try a different search term."
                : "Create your first organization to get started."}
            </Box>
            {!debouncedSearch && (
              <Button
                intent="primary"
                onClick={() => router.push("/organization/create")}
                sx={{ mt: 1.5 }}
              >
                Create Organization
              </Button>
            )}
          </Box>
        ) : (
          <Box sx={styles.list}>
            {organizations.map((org) => (
              <Box
                key={org.id}
                sx={styles.card}
                onClick={() => router.push(`/organization/${org.id}`)}
              >
                <Box sx={styles.cardInitial}>
                  {org.name.charAt(0).toUpperCase()}
                </Box>

                <Box sx={styles.cardMain}>
                  <Box sx={styles.cardName}>{org.name}</Box>
                  <Box
                    sx={{
                      display: "inline-flex",
                      px: 0.75,
                      py: 0.2,
                      fontSize: "0.67rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      flexShrink: 0,
                      backgroundColor: roleBadge[org.role]?.bg,
                      color: roleBadge[org.role]?.color,
                      border: `1px solid ${roleBadge[org.role]?.border}`,
                    }}
                  >
                    {org.role}
                  </Box>
                </Box>

                <Box sx={styles.cardRight}>
                  <Box sx={styles.metaStat}>
                    <GroupOutlinedIcon sx={{ fontSize: "0.8rem" }} />
                    {org.memberCount} {org.memberCount === 1 ? "member" : "members"}
                  </Box>
                  <Box sx={styles.metaStat}>
                    <LayersOutlinedIcon sx={{ fontSize: "0.8rem" }} />
                    {org.projectCount} {org.projectCount === 1 ? "project" : "projects"}
                  </Box>
                  <Box sx={styles.metaDate}>
                    {new Date(org.createdAt).toLocaleDateString("en-US", {
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
          {isFetchingNextPage && (
            <CircularProgress size={18} sx={{ color: frappe.blue }} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
