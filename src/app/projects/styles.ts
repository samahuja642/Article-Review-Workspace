import type { SxProps, Theme } from "@mui/material/styles";
import { frappe } from "~/theme/colors";

export const styles = {
  page: {
    minHeight: "calc(100vh - 56px)",
    backgroundColor: frappe.base,
    display: "flex",
    flexDirection: "column",
  } satisfies SxProps<Theme>,

  pageHeader: {
    px: { xs: 3, md: 6 },
    pt: 5,
    pb: 4,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 3,
    borderBottom: `1px solid ${frappe.surface0}`,
    flexWrap: "wrap" as const,
  } satisfies SxProps<Theme>,

  pageHeaderLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
  } satisfies SxProps<Theme>,

  pageEyebrow: {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: frappe.overlay0,
  } satisfies SxProps<Theme>,

  pageTitle: {
    fontSize: "1.6rem",
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: frappe.text,
    lineHeight: 1.15,
  } satisfies SxProps<Theme>,

  toolbar: {
    px: { xs: 3, md: 6 },
    py: 2.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 2,
    borderBottom: `1px solid ${frappe.surface0}`,
    flexWrap: "wrap" as const,
  } satisfies SxProps<Theme>,

  searchBox: {
    width: { xs: "100%", sm: 260 },
  } satisfies SxProps<Theme>,

  content: {
    px: { xs: 3, md: 6 },
    py: 4,
    flex: 1,
  } satisfies SxProps<Theme>,

  list: {
    border: `1px solid ${frappe.surface0}`,
    backgroundColor: frappe.mantle,
    overflow: "hidden",
  } satisfies SxProps<Theme>,

  row: {
    px: 3,
    py: 2,
    display: "flex",
    alignItems: "center",
    gap: 2.5,
    cursor: "pointer",
    borderBottom: `1px solid ${frappe.surface0}`,
    transition: "background-color 0.12s ease",
    "&:last-child": { borderBottom: "none" },
    "&:hover": { backgroundColor: `${frappe.surface0}55` },
  } satisfies SxProps<Theme>,

  rowInitial: {
    width: 34,
    height: 34,
    flexShrink: 0,
    backgroundColor: frappe.surface0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.875rem",
    fontWeight: 700,
    color: frappe.blue,
    letterSpacing: "-0.01em",
  } satisfies SxProps<Theme>,

  rowMain: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.25,
  } satisfies SxProps<Theme>,

  rowName: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: frappe.text,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  } satisfies SxProps<Theme>,

  rowOrg: {
    fontSize: "0.73rem",
    color: frappe.overlay0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  } satisfies SxProps<Theme>,

  rowRight: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    flexShrink: 0,
  } satisfies SxProps<Theme>,

  rowStat: {
    display: "flex",
    alignItems: "center",
    gap: 0.6,
    fontSize: "0.75rem",
    color: frappe.overlay1,
    whiteSpace: "nowrap" as const,
  } satisfies SxProps<Theme>,

  rowDate: {
    fontSize: "0.72rem",
    color: frappe.overlay0,
    minWidth: 64,
    textAlign: "right" as const,
  } satisfies SxProps<Theme>,

  sentinel: {
    height: 48,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mt: 2,
  } satisfies SxProps<Theme>,

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    py: 14,
    gap: 1.5,
    textAlign: "center",
  } satisfies SxProps<Theme>,

  emptyIcon: {
    color: frappe.surface1,
    fontSize: "2.5rem",
    mb: 0.5,
  } satisfies SxProps<Theme>,

  emptyTitle: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: frappe.subtext1,
  } satisfies SxProps<Theme>,

  emptyDesc: {
    fontSize: "0.82rem",
    color: frappe.overlay0,
  } satisfies SxProps<Theme>,

  skeletonList: {
    border: `1px solid ${frappe.surface0}`,
    overflow: "hidden",
  } satisfies SxProps<Theme>,

  skeletonRow: {
    height: 58,
    backgroundColor: frappe.mantle,
    borderBottom: `1px solid ${frappe.surface0}`,
    "&:last-child": { borderBottom: "none" },
  } satisfies SxProps<Theme>,
};

export const roleBadge: Record<string, { bg: string; color: string; border: string }> = {
  OWNER: { bg: `${frappe.mauve}18`, color: frappe.mauve, border: `${frappe.mauve}33` },
  MEMBER: { bg: `${frappe.blue}18`, color: frappe.blue, border: `${frappe.blue}33` },
};
