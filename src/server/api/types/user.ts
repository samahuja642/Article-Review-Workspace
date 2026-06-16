import type { db } from "~/server/db";
type DbClient = typeof db;

export interface SearchUserParams {
    db: DbClient;
    email: string;
    excludeOrganizationId?: string;
    organizationId?: string;
    excludeProjectId?: string;
}
