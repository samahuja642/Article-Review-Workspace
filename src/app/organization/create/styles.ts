import type { SxProps, Theme } from "@mui/material/styles";

const frappe = {
  base: "#303446",
  mantle: "#292c3c",
  surface0: "#414559",
  surface1: "#51576d",
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  overlay0: "#737994",
  overlay1: "#838ba7",
  blue: "#8caaee",
  lavender: "#babbf1",
  green: "#a6d189",
  mauve: "#ca9ee6",
  teal: "#81c8be",
};

export const styles = {
  page: {
    minHeight: "calc(100vh - 56px)",
    backgroundColor: frappe.base,
    display: "grid",
    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
    maxWidth: 1100,
    mx: "auto",
    px: { xs: 3, md: 6 },
    py: { xs: 6, lg: 0 },
    gap: { xs: 6, lg: 12 },
    alignItems: "center",
  } satisfies SxProps<Theme>,

  left: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    py: { lg: 10 },
  } satisfies SxProps<Theme>,

  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    fontSize: "0.8rem",
    color: frappe.overlay1,
    textDecoration: "none",
    letterSpacing: "0.02em",
    cursor: "pointer",
    width: "fit-content",
    transition: "color 0.15s ease",
    "&:hover": { color: frappe.subtext1 },
  } satisfies SxProps<Theme>,

  eyebrow: {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase" as const,
    color: frappe.overlay0,
  } satisfies SxProps<Theme>,

  heading: {
    fontSize: { xs: "2.2rem", md: "2.8rem" },
    fontWeight: 700,
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    color: frappe.text,
    m: 0,
  } satisfies SxProps<Theme>,

  headingAccent: {
    color: frappe.blue,
    display: "block",
  } satisfies SxProps<Theme>,

  description: {
    fontSize: "0.925rem",
    color: frappe.subtext1,
    lineHeight: 1.75,
    m: 0,
    maxWidth: 400,
  } satisfies SxProps<Theme>,

  perks: {
    display: "flex",
    flexDirection: "column",
    gap: 1.5,
    pt: 1,
  } satisfies SxProps<Theme>,

  perkRow: {
    display: "flex",
    alignItems: "center",
    gap: 1.5,
  } satisfies SxProps<Theme>,

  perkIcon: {
    width: 30,
    height: 30,
    borderRadius: "6px",
    backgroundColor: frappe.surface0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  } satisfies SxProps<Theme>,

  perkText: {
    fontSize: "0.825rem",
    color: frappe.overlay1,
    lineHeight: 1.5,
  } satisfies SxProps<Theme>,

  right: {
    py: { lg: 10 },
  } satisfies SxProps<Theme>,

  formPanel: {
    backgroundColor: frappe.mantle,
    border: `1px solid ${frappe.surface0}`,
    borderRadius: "12px",
    p: { xs: 3, md: 4 },
    display: "flex",
    flexDirection: "column",
    gap: 3,
  } satisfies SxProps<Theme>,

  formLabel: {
    fontSize: "0.7rem",
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: frappe.overlay0,
    pb: 1.5,
    borderBottom: `1px solid ${frappe.surface0}`,
  } satisfies SxProps<Theme>,

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 2.5,
  } satisfies SxProps<Theme>,

  submitButton: {
    alignSelf: "flex-end",
    minWidth: 160,
  } satisfies SxProps<Theme>,
};

export const perkColors: Record<string, string> = {
  blue: "#8caaee",
  green: "#a6d189",
  mauve: "#ca9ee6",
};
