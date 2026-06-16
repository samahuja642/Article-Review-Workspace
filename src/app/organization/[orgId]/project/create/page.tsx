import Box from "@mui/material/Box";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TrackChangesOutlinedIcon from "@mui/icons-material/TrackChangesOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { CreateProjectForm } from "./_components/CreateProjectForm";
import { styles, perkColors } from "./styles";

export const metadata = { title: "Create Project" };

const perks = [
  {
    icon: <ArticleOutlinedIcon sx={{ fontSize: "0.95rem", color: perkColors.blue }} />,
    text: "Upload and manage article sets for systematic literature review.",
  },
  {
    icon: <TrackChangesOutlinedIcon sx={{ fontSize: "0.95rem", color: perkColors.green }} />,
    text: "Track each article through the full review pipeline from pending to decision.",
  },
  {
    icon: <GroupOutlinedIcon sx={{ fontSize: "0.95rem", color: perkColors.sky }} />,
    text: "Assign reviewers and collaborate across the project team.",
  },
];

export default async function CreateProjectPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  return (
    <Box sx={styles.page}>
      <Box sx={styles.left}>
        <Box component={Link} href={`/organization/${orgId}`} sx={styles.backLink}>
          <ArrowBackIcon sx={{ fontSize: "0.85rem" }} />
          Back to organization
        </Box>

        <Box>
          <Box sx={styles.eyebrow}>New project</Box>
          <Box component="h1" sx={styles.heading}>
            Set up your
            <Box component="span" sx={styles.headingAccent}>project.</Box>
          </Box>
        </Box>

        <Box component="p" sx={styles.description}>
          A project scopes a set of articles for review. All team activity,
          status tracking, and decisions are organized within it.
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
          <Box sx={styles.formLabel}>Project details</Box>
          <CreateProjectForm orgId={orgId} />
        </Box>
      </Box>
    </Box>
  );
}
