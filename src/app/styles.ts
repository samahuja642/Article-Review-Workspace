import type { SxProps, Theme } from "@mui/material/styles";

const frappe = {
  base: "#303446",
  surface0: "#414559",
  surface1: "#51576d",
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  subtext0: "#a5adce",
  overlay1: "#838ba7",
  overlay0: "#737994",
  blue: "#8caaee",
  mauve: "#ca9ee6",
  lavender: "#babbf1",
  green: "#a6d189",
  peach: "#ef9f76",
  red: "#e78284",
  sky: "#99d1db",
  crust: "#232634",
  mantle: "#292c3c",
};

export const styles = {
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    backgroundColor: frappe.base,
  } satisfies SxProps<Theme>,

  nav: {
    px: { xs: 3, md: 6 },
    py: 2.5,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${frappe.surface0}`,
  } satisfies SxProps<Theme>,

  navLogo: {
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: frappe.text,
  } satisfies SxProps<Theme>,

  navMeta: {
    fontSize: "0.75rem",
    color: frappe.overlay0,
    letterSpacing: "0.04em",
  } satisfies SxProps<Theme>,

  main: {
    flex: 1,
    display: "grid",
    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
    maxWidth: 1200,
    mx: "auto",
    width: "100%",
    px: { xs: 3, md: 6 },
    py: { xs: 8, md: 0 },
    alignItems: "center",
    gap: { xs: 8, lg: 12 },
  } satisfies SxProps<Theme>,

  left: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    py: { lg: 10 },
  } satisfies SxProps<Theme>,

  label: {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: frappe.overlay1,
  } satisfies SxProps<Theme>,

  heading: {
    fontSize: { xs: "2.8rem", md: "3.8rem" },
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.08,
    color: frappe.text,
    m: 0,
  } satisfies SxProps<Theme>,

  headingAccent: {
    color: frappe.blue,
    display: "block",
  } satisfies SxProps<Theme>,

  description: {
    fontSize: "1rem",
    color: frappe.subtext1,
    lineHeight: 1.75,
    maxWidth: 440,
    m: 0,
  } satisfies SxProps<Theme>,

  cta: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexWrap: "wrap" as const,
  } satisfies SxProps<Theme>,

  ctaHint: {
    fontSize: "0.78rem",
    color: frappe.overlay0,
  } satisfies SxProps<Theme>,

  right: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
    py: { lg: 10 },
  } satisfies SxProps<Theme>,

  rightLabel: {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: frappe.overlay0,
    mb: 1,
  } satisfies SxProps<Theme>,

  featureRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 2,
    p: 2.5,
    borderRadius: "8px",
    border: `1px solid ${frappe.surface0}`,
    backgroundColor: frappe.mantle,
    transition: "border-color 0.15s ease",
    "&:hover": {
      borderColor: frappe.surface1,
    },
  } satisfies SxProps<Theme>,

  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: "8px",
    backgroundColor: frappe.surface0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: frappe.blue,
  } satisfies SxProps<Theme>,

  featureTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: frappe.text,
    mb: 0.4,
  } satisfies SxProps<Theme>,

  featureDesc: {
    fontSize: "0.8rem",
    color: frappe.overlay1,
    lineHeight: 1.6,
  } satisfies SxProps<Theme>,

  workflowRow: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    flexWrap: "wrap" as const,
    mt: 1,
  } satisfies SxProps<Theme>,

  workflowArrow: {
    color: frappe.overlay0,
    fontSize: "0.75rem",
  } satisfies SxProps<Theme>,

  footer: {
    px: { xs: 3, md: 6 },
    py: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: `1px solid ${frappe.surface0}`,
  } satisfies SxProps<Theme>,

  footerText: {
    fontSize: "0.75rem",
    color: frappe.overlay0,
  } satisfies SxProps<Theme>,
};

export const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  Pending:   { bg: `${frappe.peach}18`,  color: frappe.peach,  border: `${frappe.peach}44`  },
  "In Review": { bg: `${frappe.blue}18`, color: frappe.blue,   border: `${frappe.blue}44`   },
  Reviewed:  { bg: `${frappe.green}18`,  color: frappe.green,  border: `${frappe.green}44`  },
  Excluded:  { bg: `${frappe.red}18`,    color: frappe.red,    border: `${frappe.red}44`    },
};
