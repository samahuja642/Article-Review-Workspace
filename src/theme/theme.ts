import { createTheme, type Theme } from "@mui/material/styles";
import { frappe, latte } from "./colors";

export function createAppTheme(mode: "light" | "dark"): Theme {
  const c = mode === "light" ? latte : frappe;

  return createTheme({
    palette: {
      mode,
      primary: {
        main: c.blue,
        light: c.lavender,
        dark: c.sapphire,
        contrastText: mode === "light" ? "#ffffff" : c.crust,
      },
      secondary: {
        main: c.mauve,
        light: c.pink,
        dark: c.maroon,
        contrastText: mode === "light" ? "#ffffff" : c.crust,
      },
      error: {
        main: c.red,
      },
      warning: {
        main: c.peach,
      },
      info: {
        main: c.sky,
      },
      success: {
        main: c.green,
      },
      background: {
        default: c.base,
        paper: c.mantle,
      },
      text: {
        primary: c.text,
        secondary: c.subtext1,
        disabled: c.overlay1,
      },
      divider: c.surface1,
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: c.mantle,
            borderColor: c.surface0,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: c.surface0,
            borderColor: c.surface1,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: c.crust,
            borderBottom: `1px solid ${c.surface0}`,
            boxShadow: "none",
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: c.surface1,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: c.surface1,
            color: c.text,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            letterSpacing: "0.01em",
            borderRadius: 4,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: c.surface1,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: c.overlay1,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: c.blue,
              borderWidth: "1px",
            },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: c.subtext1,
            "&.Mui-focused": { color: c.blue },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 4,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontSize: "0.82rem",
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            backgroundColor: c.surface0,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: c.surface2,
            color: c.text,
            fontSize: "0.75rem",
            borderRadius: 4,
          },
        },
      },
    },
  });
}

// Default dark theme for backward compat
export default createAppTheme("dark");
