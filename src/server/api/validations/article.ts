import { z } from "zod";

export const reviewStatusEnum = z.enum(["PENDING", "IN_REVIEW", "REVIEWED", "EXCLUDED"]);

export const getArticlesByProjectSchema = z.object({
    projectId: z.string().min(1),
    cursor: z.string().trim().optional(),
    limit: z.number().min(1).max(100).default(20),
    search: z.string().optional(),
    reviewStatus: reviewStatusEnum.optional(),
});

export const createArticleSchema = z.object({
    projectId: z.string().min(1),
    title: z.string().min(1, "Title is required").max(500),
    pmid: z.string().optional(),
    authors: z.string().optional(),
    journal: z.string().optional(),
    publicationYear: z.number().int().min(1000).max(9999).optional(),
    doi: z.string().optional(),
    pmcid: z.string().optional(),
});

export const updateArticleStatusSchema = z.object({
    articleId: z.string().min(1),
    reviewStatus: reviewStatusEnum,
});

export const deleteArticleSchema = z.object({
    articleId: z.string().min(1),
});

export const importArticleRowSchema = z.object({
    title: z.string().min(1),
    pmid: z.string().optional(),
    authors: z.string().optional(),
    citation: z.string().optional(),
    firstAuthor: z.string().optional(),
    journal: z.string().optional(),
    publicationYear: z.number().int().min(1000).max(9999).optional(),
    createDate: z.string().optional(),
    pmcid: z.string().optional(),
    nihmsId: z.string().optional(),
    doi: z.string().optional(),
});

export const importArticlesSchema = z.object({
    projectId: z.string().min(1),
    rows: z.array(importArticleRowSchema).max(1000).default([]),
    overwrites: z.array(z.object({
        articleId: z.string().min(1),
        data: importArticleRowSchema,
    })).max(1000).optional(),
});

export const checkConflictsSchema = z.object({
    projectId: z.string().min(1),
    pmids: z.array(z.string().min(1)).min(1).max(1000),
});

export const updateArticleFieldsSchema = z.object({
    articleId: z.string().min(1),
    title: z.string().min(1, "Title is required").max(500),
    pmid: z.string().optional(),
    authors: z.string().optional(),
    citation: z.string().optional(),
    firstAuthor: z.string().optional(),
    journal: z.string().optional(),
    publicationYear: z.number().int().min(1000).max(9999).optional(),
    createDate: z.string().optional(),
    pmcid: z.string().optional(),
    nihmsId: z.string().optional(),
    doi: z.string().optional(),
});
