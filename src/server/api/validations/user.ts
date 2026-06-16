import { z } from "zod";

export const searchUserSchema = z.object({
    email: z.string().min(1),
    excludeOrganizationId: z.string().optional(),
    organizationId: z.string().optional(),
    excludeProjectId: z.string().optional(),
});
