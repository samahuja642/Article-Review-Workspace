import { createTRPCRouter, protectedProcedure } from "../trpc";
import { searchUserSchema } from "../validations/user";
import { searchUsers } from "../services/user";

export const userRouter = createTRPCRouter({
    search: protectedProcedure
        .input(searchUserSchema)
        .query(({ ctx, input }) =>
            searchUsers({ db: ctx.db, ...input }),
        ),
});
