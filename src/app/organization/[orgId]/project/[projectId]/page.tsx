import { notFound } from "next/navigation";
import { api } from "~/trpc/server";
import { ArticleList } from "./_components/ArticleList";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; projectId: string }>;
}) {
  const { orgId, projectId } = await params;

  const project = await api.project.getById({ projectId }).catch(() => null);
  if (!project) notFound();

  return (
    <ArticleList
      orgId={orgId}
      orgName={project.organizationName}
      projectId={projectId}
      projectName={project.name}
      role={project.role ?? "MEMBER"}
      memberCount={project.memberCount}
      articleCount={project.articleCount}
    />
  );
}
