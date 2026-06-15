"use client";

import { createTheme } from "@mui/material/styles";

// Catppuccin Frappé palette
const frappe = {
  rosewater: "#f2d5cf",
  flamingo: "#eebebe",
  pink: "#f4b8e4",
  mauve: "#ca9ee6",
  red: "#e78284",
  maroon: "#ea999c",
  peach: "#ef9f76",
  yellow: "#e5c890",
  green: "#a6d189",
  teal: "#81c8be",
  sky: "#99d1db",
  sapphire: "#85c1dc",
  blue: "#8caaee",
  lavender: "#babbf1",
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  subtext0: "#a5adce",
  overlay2: "#949cbb",
  overlay1: "#838ba7",
  overlay0: "#737994",
  surface2: "#626880",
  surface1: "#51576d",
  surface0: "#414559",
  base: "#303446",
  mantle: "#292c3c",
  crust: "#232634",
};

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
