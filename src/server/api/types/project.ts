import type { db } from "~/server/db";

type DbClient = typeof db;

export interface createProjectInput {
    name: string;
    organizationId: string;
}

export interface createProjectParams {
    db: DbClient;
    userId: string;
    input: createProjectInput;
}

export interface getProjectsByOrgParams {
    db: DbClient;
    userId: string;
    organizationId: string;
    cursor?: string;
    limit?: number;
    search?: string;
}

export interface addProjectMemberParams {
    db: DbClient;
    requesterId: string;
    projectId: string;
    userId: string;
}
