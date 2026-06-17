"use client";

import MuiTypography, { type TypographyProps } from "@mui/material/Typography";
import { useThemeColors } from "~/theme/useThemeColors";

function Heading1(props: TypographyProps) {
  const c = useThemeColors();
  return (
    <MuiTypography
      component="h1"
      sx={{ color: c.text, fontWeight: 700, fontSize: "2rem", lineHeight: 1.25, letterSpacing: "-0.02em" }}
      {...props}
    />
  );
}

function Heading2(props: TypographyProps) {
  const c = useThemeColors();
  return (
    <MuiTypography
      component="h2"
      sx={{ color: c.text, fontWeight: 600, fontSize: "1.5rem", lineHeight: 1.3, letterSpacing: "-0.01em" }}
      {...props}
    />
  );
}

function Heading3(props: TypographyProps) {
  const c = useThemeColors();
  return (
    <MuiTypography
      component="h3"
      sx={{ color: c.lavender, fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.4 }}
      {...props}
    />
  );
}

function BodyText(props: TypographyProps) {
  const c = useThemeColors();
  return (
    <MuiTypography
      component="p"
      sx={{ color: c.subtext1, fontSize: "0.9375rem", lineHeight: 1.65 }}
      {...props}
    />
  );
}

function Caption(props: TypographyProps) {
  const c = useThemeColors();
  return (
    <MuiTypography
      component="span"
      sx={{ color: c.overlay1, fontSize: "0.8rem", lineHeight: 1.5 }}
      {...props}
    />
  );
}

function Label(props: TypographyProps) {
  const c = useThemeColors();
  return (
    <MuiTypography
      component="span"
      sx={{ color: c.subtext0, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}
      {...props}
    />
  );
}

export { Heading1, Heading2, Heading3, BodyText, Caption, Label };
export type { TypographyProps };
