import type { SxProps, Theme } from "@mui/material/styles";

export const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 2.5,
  } satisfies SxProps<Theme>,

  submitButton: {
    alignSelf: "flex-end",
    minWidth: 160,
  } satisfies SxProps<Theme>,
};
