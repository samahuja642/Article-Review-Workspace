import { z } from 'zod';

export const createOrganizationSchema = z.object({
    name: z.string(),
});

export const getAllOrganizationSchema = z.object({
    cursor: z.string().trim().optional(),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
});

export const getOrganizationByIdSchema = z.object({
    id: z.string().min(1),
});

export const addOrganizationMemberSchema = z.object({
    organizationId: z.string().min(1),
    userId: z.string().min(1),
});