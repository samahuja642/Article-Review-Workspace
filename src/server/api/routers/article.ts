import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
    getArticlesByProjectSchema,
    createArticleSchema,
    updateArticleStatusSchema,
    deleteArticleSchema,
    importArticlesSchema,
    checkConflictsSchema,
    updateArticleFieldsSchema,
} from "../validations/article";
import {
    getArticlesByProject,
    createArticle,
    updateArticleStatus,
    deleteArticle,
    importArticles,
    checkConflicts,
    updateArticleFields,
} from "../services/article";

export const articleRouter = createTRPCRouter({
    getByProject: protectedProcedure
        .input(getArticlesByProjectSchema)
        .query(({ ctx, input }) =>
            getArticlesByProject({
                db: ctx.db,
                userId: ctx.session.user.id,
                projectId: input.projectId,
                cursor: input.cursor,
                limit: input.limit,
                search: input.search,
                reviewStatus: input.reviewStatus,
            }),
        ),

    create: protectedProcedure
        .input(createArticleSchema)
        .mutation(({ ctx, input }) =>
            createArticle({ db: ctx.db, userId: ctx.session.user.id, input }),
        ),

    updateStatus: protectedProcedure
        .input(updateArticleStatusSchema)
        .mutation(({ ctx, input }) =>
            updateArticleStatus({
                db: ctx.db,
                userId: ctx.session.user.id,
                articleId: input.articleId,
                reviewStatus: input.reviewStatus,
            }),
        ),

    delete: protectedProcedure
        .input(deleteArticleSchema)
        .mutation(({ ctx, input }) =>
            deleteArticle({ db: ctx.db, userId: ctx.session.user.id, articleId: input.articleId }),
        ),

    import: protectedProcedure
        .input(importArticlesSchema)
        .mutation(({ ctx, input }) =>
            importArticles({
                db: ctx.db,
                userId: ctx.session.user.id,
                projectId: input.projectId,
                rows: input.rows,
                overwrites: input.overwrites,
            }),
        ),

    checkConflicts: protectedProcedure
        .input(checkConflictsSchema)
        .query(({ ctx, input }) =>
            checkConflicts({
                db: ctx.db,
                userId: ctx.session.user.id,
                projectId: input.projectId,
                pmids: input.pmids,
            }),
        ),

    updateFields: protectedProcedure
        .input(updateArticleFieldsSchema)
        .mutation(({ ctx, input }) =>
            updateArticleFields({
                db: ctx.db,
                userId: ctx.session.user.id,
                articleId: input.articleId,
                data: {
                    title: input.title,
                    pmid: input.pmid,
                    authors: input.authors,
                    citation: input.citation,
                    firstAuthor: input.firstAuthor,
                    journal: input.journal,
                    publicationYear: input.publicationYear,
                    createDate: input.createDate,
                    pmcid: input.pmcid,
                    nihmsId: input.nihmsId,
                    doi: input.doi,
                },
            }),
        ),
});
