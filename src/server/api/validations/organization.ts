import { z } from 'zod';
export const createOrganizationSchema = z.object({
    name: z.string(),
});

export const getAllOrganizationSchema = z.object({
    cursor: z.string().trim().optional(),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
})