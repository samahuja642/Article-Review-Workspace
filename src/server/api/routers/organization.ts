import { 
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { createOrganizationSchema, getAllOrganizationSchema } from "../validations/organization";
import { createOrganization, getAllOrganizationsByUserId } from "../services/organization";

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
        })
})