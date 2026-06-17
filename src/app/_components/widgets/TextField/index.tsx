"use client";

import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";
import { useThemeColors } from "~/theme/useThemeColors";

function TextField(props: TextFieldProps) {
  const c = useThemeColors();

  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: c.mantle,
          borderRadius: "4px",
          color: c.text,
          "& fieldset": { borderColor: c.surface1 },
          "&:hover fieldset": { borderColor: c.overlay1 },
          "&.Mui-focused fieldset": { borderColor: c.blue, borderWidth: "1px" },
          "&.Mui-error fieldset": { borderColor: c.red },
        },
        "& .MuiInputLabel-root": {
          color: c.subtext1,
          "&.Mui-focused": { color: c.blue },
          "&.Mui-error": { color: c.red },
        },
        "& .MuiInputBase-input": {
          color: c.text,
          "&::placeholder": { color: c.overlay1, opacity: 1 },
        },
        "& .MuiFormHelperText-root": {
          color: c.overlay1,
          "&.Mui-error": { color: c.red },
        },
        ...(props.sx as object),
      }}
    />
  );
}

export { TextField };
export type { TextFieldProps };
