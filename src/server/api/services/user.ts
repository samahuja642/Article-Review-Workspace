import type { SearchUserParams } from "../types/user";

export async function searchUsers({ db, email, excludeOrganizationId, organizationId, excludeProjectId }: SearchUserParams) {
    return db.user.findMany({
        where: {
            email: { contains: email, mode: "insensitive" },
            ...(organizationId ? {
                organizationMembership: { some: { organizationId } },
            } : {}),
            ...(excludeOrganizationId ? {
                NOT: { organizationMembership: { some: { organizationId: excludeOrganizationId } } },
            } : {}),
            ...(excludeProjectId ? {
                NOT: { memberships: { some: { projectId: excludeProjectId } } },
            } : {}),
        },
        select: { id: true, name: true, email: true, image: true },
        take: 8,
    });
}
