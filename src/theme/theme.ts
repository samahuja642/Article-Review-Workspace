"use client";

import { createTheme } from "@mui/material/styles";
import { frappe } from "./colors";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: frappe.blue,
      light: frappe.lavender,
      dark: frappe.sapphire,
      contrastText: frappe.crust,
    },
    secondary: {
      main: frappe.mauve,
      light: frappe.pink,
      dark: frappe.maroon,
      contrastText: frappe.crust,
    },
    error: {
      main: frappe.red,
    },
    warning: {
      main: frappe.peach,
    },
    info: {
      main: frappe.sky,
    },
    success: {
      main: frappe.green,
    },
    background: {
      default: frappe.base,
      paper: frappe.mantle,
    },
    text: {
      primary: frappe.text,
      secondary: frappe.subtext1,
      disabled: frappe.overlay1,
    },
    divider: frappe.surface1,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: frappe.mantle,
          borderColor: frappe.surface0,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: frappe.surface0,
          borderColor: frappe.surface1,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: frappe.crust,
          borderBottom: `1px solid ${frappe.surface0}`,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: frappe.surface1,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: frappe.surface1,
          color: frappe.text,
        },
      },
    },
  },
});

export default theme;
