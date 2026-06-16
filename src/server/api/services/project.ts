import { TRPCError } from "@trpc/server";
import type { createProjectParams, getProjectsByOrgParams, addProjectMemberParams } from "../types/project";

export async function createProject({ db, userId, input }: createProjectParams) {
    const membership = await db.organizationMember.findFirst({
        where: { userId, organizationId: input.organizationId },
    });

    if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this organization." });
    }

    return db.project.create({
        data: {
            name: input.name,
            organizationId: input.organizationId,
            members: {
                create: { userId, role: "OWNER" },
            },
        },
    });
}

export async function getProjectsByOrganization({
    db,
    userId,
    organizationId,
    cursor,
    limit = 20,
    search,
}: getProjectsByOrgParams) {
    const membership = await db.organizationMember.findFirst({
        where: { userId, organizationId },
    });

    if (!membership) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this organization." });
    }

    const rows = await db.project.findMany({
        where: {
            organizationId,
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        },
        orderBy: { name: "asc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
        include: {
            members: {
                where: { userId },
                select: { role: true },
            },
            _count: {
                select: { members: true, articles: true },
            },
        },
    });

    let nextCursor: string | undefined = undefined;
    if (rows.length > limit) {
        const next = rows.pop();
        nextCursor = next!.id;
    }

    const items = rows.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt,
        role: p.members[0]?.role ?? "MEMBER",
        memberCount: p._count.members,
        articleCount: p._count.articles,
    }));

    return { items, nextCursor };
}

export async function addProjectMember({ db, requesterId, projectId, userId }: addProjectMemberParams) {
    const project = await db.project.findUnique({ where: { id: projectId } });
    if (!project) throw new TRPCError({ code: "NOT_FOUND" });

    const requester = await db.organizationMember.findFirst({
        where: { userId: requesterId, organizationId: project.organizationId },
    });
    if (!requester) throw new TRPCError({ code: "FORBIDDEN", message: "Only organization members can add project members." });

    const targetInOrg = await db.organizationMember.findFirst({
        where: { userId, organizationId: project.organizationId },
    });
    if (!targetInOrg) throw new TRPCError({ code: "BAD_REQUEST", message: "User must be an organization member first." });

    const existing = await db.projectMember.findFirst({ where: { userId, projectId } });
    if (existing) throw new TRPCError({ code: "CONFLICT", message: "User is already a project member." });

    return db.projectMember.create({ data: { userId, projectId, role: "MEMBER" } });
}
