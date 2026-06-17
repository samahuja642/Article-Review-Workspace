"use client";

import MuiButton, { type ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { useThemeColors } from "~/theme/useThemeColors";

type Intent = "primary" | "secondary" | "ghost" | "danger";

export type ButtonProps = Omit<MuiButtonProps, "color"> & {
  intent?: Intent;
};

export function Button({ intent = "primary", sx, ...props }: ButtonProps) {
  const c = useThemeColors();

  const intentStyles = {
    primary: {
      backgroundColor: c.blue,
      color: "#ffffff",
      "&:hover": { backgroundColor: c.sapphire, boxShadow: "none" },
      "&:active": { backgroundColor: c.sapphire },
    },
    secondary: {
      backgroundColor: c.mauve,
      color: "#ffffff",
      "&:hover": { backgroundColor: c.pink, boxShadow: "none" },
      "&:active": { filter: "brightness(0.9)" },
    },
    ghost: {
      backgroundColor: "transparent",
      color: c.text,
      border: `1px solid ${c.surface1}`,
      "&:hover": { backgroundColor: c.surface0, borderColor: c.surface1 },
      "&:active": { backgroundColor: c.surface1 },
    },
    danger: {
      backgroundColor: c.red,
      color: "#ffffff",
      "&:hover": { backgroundColor: c.maroon, boxShadow: "none" },
      "&:active": { filter: "brightness(0.9)" },
    },
  } as const;

  const disabledStyles = {
    "&.Mui-disabled": {
      backgroundColor: intent === "ghost" ? "transparent" : c.surface1,
      borderColor: intent === "ghost" ? c.surface0 : undefined,
      color: c.overlay0,
    },
  };

  const variant = intent === "ghost" ? "outlined" : "contained";

  return (
    <MuiButton
      variant={variant}
      disableElevation
      sx={{
        borderRadius: "4px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        textTransform: "none",
        transition: "all 0.15s ease",
        ...intentStyles[intent],
        ...disabledStyles,
        ...(sx as object),
      }}
      {...props}
    />
  );
}

export default Button;
