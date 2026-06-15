import type { createOrganizationParams } from "../types/organization";

export async function createOrganization({db,userId,input}:createOrganizationParams){
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