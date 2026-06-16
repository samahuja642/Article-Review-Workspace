import { 
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { createOrganizationSchema, getAllOrganizationSchema, getOrganizationByIdSchema, addOrganizationMemberSchema } from "../validations/organization";
import { createOrganization, getAllOrganizationsByUserId, getOrganizationById, addOrganizationMember } from "../services/organization";

export const organizationRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createOrganizationSchema)
        .mutation(({ctx,input})=>{
            return createOrganization({
                db: ctx.db,
                userId: ctx.session.user.id,
                input
            });
        }),
    getAll: protectedProcedure
        .input(getAllOrganizationSchema)
        .query(async ({ctx,input}) => {
            return getAllOrganizationsByUserId({
                db: ctx.db,
                userId: ctx.session.user.id,
                cursor: input.cursor,
                limit: input.limit,
                search: input.search,
            });
        }),
    getById: protectedProcedure
        .input(getOrganizationByIdSchema)
        .query(({ ctx, input }) =>
            getOrganizationById({ db: ctx.db, userId: ctx.session.user.id, id: input.id }),
        ),
    addMember: protectedProcedure
        .input(addOrganizationMemberSchema)
        .mutation(({ ctx, input }) =>
            addOrganizationMember({
                db: ctx.db,
                requesterId: ctx.session.user.id,
                organizationId: input.organizationId,
                userId: input.userId,
            }),
        ),
});