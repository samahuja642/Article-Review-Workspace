import type { createOrganizationParams, getOrganizationByUserIdParams } from "../types/organization";

export async function createOrganization({ db, userId, input }: createOrganizationParams) {
    return db.organization.create({
        data: {
            name: input.name,
            members: {
                create: {
                    userId,
                    role: "OWNER",
                },
            },
        },
    });
}

export async function getAllOrganizationsByUserId({
    db,
    userId,
    cursor,
    limit = 20,
    search,
}: getOrganizationByUserIdParams) {
    const rows = await db.organization.findMany({
        where: {
            members: { some: { userId } },
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
                select: { members: true, projects: true },
            },
        },
    });

    let nextCursor: string | undefined = undefined;
    if (rows.length > limit) {
        const next = rows.pop();
        nextCursor = next!.id;
    }

    const items = rows.map((org) => ({
        id: org.id,
        name: org.name,
        createdAt: org.createdAt,
        role: org.members[0]?.role ?? "MEMBER",
        memberCount: org._count.members,
        projectCount: org._count.projects,
    }));

    return { items, nextCursor };
}
