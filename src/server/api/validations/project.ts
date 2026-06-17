import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100),
    organizationId: z.string().min(1),
});

export const getAllProjectsSchema = z.object({
    organizationId: z.string().min(1),
    cursor: z.string().trim().optional(),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
});

export const getAllProjectsByUserAndOrganizationSchema = z.object({
    organizationId: z.string().optional(),
    cursor: z.string().trim().optional(),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
});

export const addProjectMemberSchema = z.object({
    projectId: z.string().min(1),
    userId: z.string().min(1),
});

export const getProjectByIdSchema = z.object({
    projectId: z.string().min(1),
});
