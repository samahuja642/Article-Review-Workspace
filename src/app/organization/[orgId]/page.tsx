import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { ProjectList } from "./_components/ProjectList";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;

  const org = await api.organization.getById({ id: orgId }).catch(() => null);
  if (!org) notFound();

  return (
    <ProjectList
      orgId={orgId}
      orgName={org.name}
      memberCount={org.memberCount}
      projectCount={org.projectCount}
      role={org.role}
    />
  );
}
