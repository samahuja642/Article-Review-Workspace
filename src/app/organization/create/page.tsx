"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import { CreateOrganizationForm } from "./_components/CreateOrganizationForm";
import { useStyles } from "./styles";

export default function CreateOrganizationPage() {
  const { styles, perkColors } = useStyles();

  const perks = [
    {
      icon: <LayersOutlinedIcon sx={{ fontSize: "0.95rem", color: perkColors.blue }} />,
      text: "Organize research into scoped projects with their own article sets.",
    },
    {
      icon: <GroupOutlinedIcon sx={{ fontSize: "0.95rem", color: perkColors.green }} />,
      text: "Invite team members and collaborate across the review pipeline.",
    },
    {
      icon: <AdminPanelSettingsOutlinedIcon sx={{ fontSize: "0.95rem", color: perkColors.mauve }} />,
      text: "Role-based access — owners control membership and permissions.",
    },
  ];

  return (
    <Box sx={styles.page}>
      <Box sx={styles.left}>
        <Box component={Link} href="/organization" sx={styles.backLink}>
          <ArrowBackIcon sx={{ fontSize: "0.85rem" }} />
          Organizations
        </Box>

        <Box>
          <Box sx={styles.eyebrow}>New workspace</Box>
          <Box component="h1" sx={styles.heading}>
            Set up your
            <Box component="span" sx={styles.headingAccent}>organization.</Box>
          </Box>
        </Box>

        <Box component="p" sx={styles.description}>
          An organization is the top-level workspace for your team.
          Projects and articles live inside it.
        </Box>

        <Box sx={styles.perks}>
          {perks.map((p, i) => (
            <Box key={i} sx={styles.perkRow}>
              <Box sx={styles.perkIcon}>{p.icon}</Box>
              <Box sx={styles.perkText}>{p.text}</Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={styles.right}>
        <Box sx={styles.formPanel}>
          <Box sx={styles.formLabel}>Organization details</Box>
          <CreateOrganizationForm />
        </Box>
      </Box>
    </Box>
  );
}
