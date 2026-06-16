import type { db } from "~/server/db";
export interface createOrganizationInput {
    name: string;
}


type DbClient = typeof db;

export interface createOrganizationParams {
    db: DbClient;
    userId: string;
    input: createOrganizationInput;
}

export interface getOrganizationByUserIdParams {
    db: DbClient;
    userId: string;
    cursor?: string;
    limit?: number;
    search?: string;
}

export interface getOrganizationByIdParams {
    db: DbClient;
    userId: string;
    id: string;
}

export interface addOrganizationMemberParams {
    db: DbClient;
    requesterId: string;
    organizationId: string;
    userId: string;
}