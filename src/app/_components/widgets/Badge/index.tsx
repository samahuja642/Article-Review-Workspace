"use client";

import MuiChip, { type ChipProps as MuiChipProps } from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import { frappe } from "~/theme/colors";

const statusStyles = {
  default: {
    backgroundColor: frappe.surface1,
    color: frappe.text,
    border: "none",
  },
  success: {
    backgroundColor: `${frappe.green}22`,
    color: frappe.green,
    border: `1px solid ${frappe.green}55`,
  },
  error: {
    backgroundColor: `${frappe.red}22`,
    color: frappe.red,
    border: `1px solid ${frappe.red}55`,
  },
  warning: {
    backgroundColor: `${frappe.peach}22`,
    color: frappe.peach,
    border: `1px solid ${frappe.peach}55`,
  },
  info: {
    backgroundColor: `${frappe.sky}22`,
    color: frappe.sky,
    border: `1px solid ${frappe.sky}55`,
  },
} as const;

type Status = keyof typeof statusStyles;

export type BadgeProps = Omit<MuiChipProps, "color"> & {
  status?: Status;
};

const StyledBadge = styled(MuiChip)<{ ownerState: { status: Status } }>(
  ({ ownerState }) => ({
    borderRadius: "4px",
    fontWeight: 600,
    fontSize: "0.72rem",
    height: "22px",
    letterSpacing: "0.04em",
    "& .MuiChip-label": { padding: "0 8px" },
    ...statusStyles[ownerState.status],
  }),
);

export function Badge({ status = "default", ...props }: BadgeProps) {
  return <StyledBadge ownerState={{ status }} {...props} />;
}

export default Badge;
