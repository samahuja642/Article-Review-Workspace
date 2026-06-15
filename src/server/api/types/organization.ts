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