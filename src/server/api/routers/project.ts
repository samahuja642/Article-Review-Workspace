import { createTRPCRouter, protectedProcedure } from "../trpc";
import { createProjectSchema, getAllProjectsSchema, addProjectMemberSchema, getAllProjectsByUserAndOrganizationSchema } from "../validations/project";
import { createProject, getProjectsByOrganization, addProjectMember, getAllProjectsByUserAndOrganizationId } from "../services/project";

export const projectRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createProjectSchema)
        .mutation(({ ctx, input }) =>
            createProject({ db: ctx.db, userId: ctx.session.user.id, input }),
        ),

    getAll: protectedProcedure
        .input(getAllProjectsSchema)
        .query(({ ctx, input }) =>
            getProjectsByOrganization({
                db: ctx.db,
                userId: ctx.session.user.id,
                organizationId: input.organizationId,
                cursor: input.cursor,
                limit: input.limit,
                search: input.search,
            }),
        ),

    getAllProjectsByUserAndOrganization: protectedProcedure
        .input(getAllProjectsByUserAndOrganizationSchema)
        .query(({ ctx, input }) =>
            getAllProjectsByUserAndOrganizationId({
                db: ctx.db,
                userId: ctx.session.user.id,
                organizationId: input.organizationId,
                cursor: input.cursor,
                limit: input.limit,
                search: input.search,
            }),
        ),

    addMember: protectedProcedure
        .input(addProjectMemberSchema)
        .mutation(({ ctx, input }) =>
            addProjectMember({
                db: ctx.db,
                requesterId: ctx.session.user.id,
                projectId: input.projectId,
                userId: input.userId,
            }),
        ),
});
