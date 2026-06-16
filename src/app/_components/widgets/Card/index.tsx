"use client";

import MuiCard, { type CardProps } from "@mui/material/Card";
import MuiCardContent from "@mui/material/CardContent";
import MuiCardActions from "@mui/material/CardActions";
import { styled } from "@mui/material/styles";
import Box, { type BoxProps } from "@mui/material/Box";
import { frappe } from "~/theme/colors";

const Card = styled(MuiCard)({
  backgroundColor: frappe.mantle,
  border: `1px solid ${frappe.surface1}`,
  borderRadius: "10px",
  boxShadow: `0 2px 8px rgba(0,0,0,0.3)`,
  backgroundImage: "none",
});

const CardHeader = styled(Box)({
  padding: "16px 20px 12px",
  borderBottom: `1px solid ${frappe.surface0}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  "& .MuiTypography-root": {
    color: frappe.text,
    fontWeight: 600,
  },
});

const CardContent = styled(MuiCardContent)({
  padding: "16px 20px",
  "&:last-child": {
    paddingBottom: "16px",
  },
});

const CardFooter = styled(MuiCardActions)({
  padding: "12px 20px 16px",
  borderTop: `1px solid ${frappe.surface0}`,
  gap: "8px",
});

export { Card, CardHeader, CardContent, CardFooter };
export type { CardProps, BoxProps };
