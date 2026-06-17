"use client";

import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useThemeMode } from "~/theme/ThemeContext";
import { useThemeColors } from "~/theme/useThemeColors";

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();
  const c = useThemeColors();

  return (
    <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton
        onClick={toggleMode}
        size="small"
        sx={{
          position: "fixed",
          top: 14,
          right: 16,
          zIndex: 1300,
          color: c.overlay1,
          backgroundColor: c.mantle,
          border: `1px solid ${c.surface0}`,
          width: 32,
          height: 32,
          "&:hover": {
            backgroundColor: c.surface0,
            color: c.text,
          },
        }}
      >
        {mode === "dark" ? (
          <LightModeOutlinedIcon sx={{ fontSize: "1rem" }} />
        ) : (
          <DarkModeOutlinedIcon sx={{ fontSize: "1rem" }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
