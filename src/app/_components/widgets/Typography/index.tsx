"use client";

import MuiTypography, { type TypographyProps } from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

const frappe = {
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  subtext0: "#a5adce",
  overlay1: "#838ba7",
  lavender: "#babbf1",
};

const StyledH1 = styled(MuiTypography)({
  color: frappe.text,
  fontWeight: 700,
  fontSize: "2rem",
  lineHeight: 1.25,
  letterSpacing: "-0.02em",
});

const StyledH2 = styled(MuiTypography)({
  color: frappe.text,
  fontWeight: 600,
  fontSize: "1.5rem",
  lineHeight: 1.3,
  letterSpacing: "-0.01em",
});

const StyledH3 = styled(MuiTypography)({
  color: frappe.lavender,
  fontWeight: 600,
  fontSize: "1.125rem",
  lineHeight: 1.4,
});

const StyledBody = styled(MuiTypography)({
  color: frappe.subtext1,
  fontSize: "0.9375rem",
  lineHeight: 1.65,
});

const StyledCaption = styled(MuiTypography)({
  color: frappe.overlay1,
  fontSize: "0.8rem",
  lineHeight: 1.5,
});

const StyledLabel = styled(MuiTypography)({
  color: frappe.subtext0,
  fontSize: "0.75rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
});

function Heading1(props: TypographyProps) {
  return <StyledH1 component="h1" {...props} />;
}

function Heading2(props: TypographyProps) {
  return <StyledH2 component="h2" {...props} />;
}

function Heading3(props: TypographyProps) {
  return <StyledH3 component="h3" {...props} />;
}

function BodyText(props: TypographyProps) {
  return <StyledBody component="p" {...props} />;
}

function Caption(props: TypographyProps) {
  return <StyledCaption component="span" {...props} />;
}

function Label(props: TypographyProps) {
  return <StyledLabel component="span" {...props} />;
}

export { Heading1, Heading2, Heading3, BodyText, Caption, Label };
export type { TypographyProps };
