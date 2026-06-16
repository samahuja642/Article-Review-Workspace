"use client";

import MuiDialog, { type DialogProps } from "@mui/material/Dialog";
import MuiDialogContent from "@mui/material/DialogContent";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { frappe } from "~/theme/colors";

function Dialog({ children, ...props }: DialogProps) {
  return (
    <MuiDialog
      maxWidth="sm"
      fullWidth
      {...props}
      slotProps={{
        ...props.slotProps,
        paper: {
          sx: {
            backgroundColor: frappe.mantle,
            border: `1px solid ${frappe.surface0}`,
            borderRadius: 0,
            backgroundImage: "none",
          },
        },
      }}
    >
      {children}
    </MuiDialog>
  );
}

interface DialogHeaderProps {
  title: string;
  onClose: () => void;
}

function DialogHeader({ title, onClose }: DialogHeaderProps) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${frappe.surface0}`,
      }}
    >
      <Box sx={{ fontSize: "0.9rem", fontWeight: 700, color: frappe.text }}>
        {title}
      </Box>
      <IconButton size="small" onClick={onClose} sx={{ color: frappe.overlay1 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

const DialogBody = styled(MuiDialogContent)({
  padding: "24px !important",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
});

export { Dialog, DialogHeader, DialogBody };
export type { DialogProps };
