import Box from "@mui/material/Box";
import { Card, CardHeader, CardContent } from "~/app/_components/widgets/Card";
import { Heading2, BodyText } from "~/app/_components/widgets/Typography";
import { CreateOrganizationForm } from "./_components/CreateOrganizationForm";
import { styles } from "./styles";

export const metadata = {
  title: "Create Organization",
};

export default function CreateOrganizationPage() {
  return (
    <Box sx={styles.page}>
      <Card sx={styles.card}>
        <CardHeader>
          <Box sx={styles.headerContent}>
            <Heading2>Create Organization</Heading2>
            <BodyText>
              Set up a new organization to manage your projects and team.
            </BodyText>
          </Box>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>
    </Box>
  );
}
