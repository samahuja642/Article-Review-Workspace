"use client";

import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

const frappe = {
  base: "#303446",
  surface1: "#51576d",
  text: "#c6d0f5",
  subtext1: "#b5bfe2",
  overlay1: "#838ba7",
  blue: "#8caaee",
  red: "#e78284",
};

const StyledTextField = styled(MuiTextField)({
  "& .MuiOutlinedInput-root": {
    backgroundColor: frappe.base,
    borderRadius: "6px",
    color: frappe.text,
    "& fieldset": { borderColor: frappe.surface1 },
    "&:hover fieldset": { borderColor: frappe.overlay1 },
    "&.Mui-focused fieldset": { borderColor: frappe.blue, borderWidth: "1px" },
    "&.Mui-error fieldset": { borderColor: frappe.red },
  },
  "& .MuiInputLabel-root": {
    color: frappe.subtext1,
    "&.Mui-focused": { color: frappe.blue },
    "&.Mui-error": { color: frappe.red },
  },
  "& .MuiInputBase-input": {
    color: frappe.text,
    "&::placeholder": { color: frappe.overlay1, opacity: 1 },
  },
  "& .MuiFormHelperText-root": {
    color: frappe.overlay1,
    "&.Mui-error": { color: frappe.red },
  },
});

function TextField(props: TextFieldProps) {
  return <StyledTextField variant="outlined" fullWidth {...props} />;
}

export { TextField };
export type { TextFieldProps };
