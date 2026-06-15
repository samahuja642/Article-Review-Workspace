import type { SxProps, Theme } from "@mui/material/styles";

export const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    p: 3,
  } satisfies SxProps<Theme>,

  card: {
    width: "100%",
    maxWidth: 480,
  } satisfies SxProps<Theme>,

  headerContent: {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
  } satisfies SxProps<Theme>,
};
