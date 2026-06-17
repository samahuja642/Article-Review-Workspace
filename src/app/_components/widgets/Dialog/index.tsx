"use client";

import MuiDialog, { type DialogProps } from "@mui/material/Dialog";
import MuiDialogContent from "@mui/material/DialogContent";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useThemeColors } from "~/theme/useThemeColors";

function Dialog({ children, ...props }: DialogProps) {
  const c = useThemeColors();

  return (
    <MuiDialog
      maxWidth="sm"
      fullWidth
      {...props}
      slotProps={{
        ...props.slotProps,
        paper: {
          sx: {
            backgroundColor: c.mantle,
            border: `1px solid ${c.surface0}`,
            borderRadius: "6px",
            backgroundImage: "none",
            minWidth: { sm: 560 },
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
  const c = useThemeColors();

  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${c.surface0}`,
      }}
    >
      <Box sx={{ fontSize: "0.925rem", fontWeight: 700, color: c.text, letterSpacing: "-0.01em" }}>
        {title}
      </Box>
      <IconButton size="small" onClick={onClose} sx={{ color: c.overlay1, "&:hover": { color: c.text } }}>
        <CloseIcon sx={{ fontSize: "1rem" }} />
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
