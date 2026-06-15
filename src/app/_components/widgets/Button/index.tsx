"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const frappe = {
  blue: "#8caaee",
  lavender: "#babbf1",
  sapphire: "#85c1dc",
  mauve: "#ca9ee6",
  pink: "#f4b8e4",
  red: "#e78284",
  maroon: "#ea999c",
  surface0: "#414559",
  surface1: "#51576d",
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  crust: "#232634",
};

const intentStyles = {
  primary: {
    backgroundColor: frappe.blue,
    color: frappe.crust,
    "&:hover": { backgroundColor: frappe.lavender, boxShadow: `0 0 0 2px ${frappe.blue}40` },
    "&:active": { backgroundColor: frappe.sapphire },
  },
  secondary: {
    backgroundColor: frappe.mauve,
    color: frappe.crust,
    "&:hover": { backgroundColor: frappe.pink, boxShadow: `0 0 0 2px ${frappe.mauve}40` },
    "&:active": { filter: "brightness(0.9)" },
  },
  ghost: {
    backgroundColor: "transparent",
    color: frappe.text,
    border: `1px solid ${frappe.surface1}`,
    "&:hover": { backgroundColor: frappe.surface0 },
    "&:active": { backgroundColor: frappe.surface1 },
  },
  danger: {
    backgroundColor: frappe.red,
    color: frappe.crust,
    "&:hover": { backgroundColor: frappe.maroon, boxShadow: `0 0 0 2px ${frappe.red}40` },
    "&:active": { filter: "brightness(0.9)" },
  },
} as const;

type Intent = keyof typeof intentStyles;

export type ButtonProps = Omit<MuiButtonProps, "color"> & {
  intent?: Intent;
};

const StyledButton = styled(MuiButton)<{ ownerState: { intent: Intent } }>(
  ({ ownerState }) => ({
    borderRadius: "6px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    textTransform: "none",
    transition: "all 0.15s ease",
    "&.Mui-disabled": {
      backgroundColor: ownerState.intent === "ghost" ? "transparent" : frappe.surface1,
      borderColor: ownerState.intent === "ghost" ? frappe.surface0 : undefined,
      color: frappe.subtext1,
    },
    ...intentStyles[ownerState.intent],
  }),
);

export function Button({ intent = "primary", ...props }: ButtonProps) {
  const variant = intent === "ghost" ? "outlined" : "contained";
  return (
    <StyledButton
      variant={variant}
      disableElevation
      ownerState={{ intent }}
      {...props}
    />
  );
}

export default Button;
