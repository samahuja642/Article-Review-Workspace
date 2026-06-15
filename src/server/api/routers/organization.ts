import { 
    createTRPCRouter,
    protectedProcedure,
    publicProcedure,
} from "~/server/api/trpc";
import { createOrganizationSchema } from "../validations/organization";
import { createOrganization } from "../services/organization";

export const organizationRouter = createTRPCRouter({
    create: protectedProcedure
        .input(createOrganizationSchema)
        .mutation(({ctx,input})=>{
            return createOrganization({
                db: ctx.db,
                userId: ctx.session.user.id,
                input
            });
        })
        
})