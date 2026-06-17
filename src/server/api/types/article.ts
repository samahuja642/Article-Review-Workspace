import type { db } from "~/server/db";

type DbClient = typeof db;

export type ReviewStatusType = "PENDING" | "IN_REVIEW" | "REVIEWED" | "EXCLUDED";

export interface getArticlesByProjectParams {
    db: DbClient;
    userId: string;
    projectId: string;
    cursor?: string;
    limit?: number;
    search?: string;
    reviewStatus?: ReviewStatusType;
}

export interface createArticleInput {
    projectId: string;
    title: string;
    pmid?: string;
    authors?: string;
    journal?: string;
    publicationYear?: number;
    doi?: string;
    pmcid?: string;
}

export interface createArticleParams {
    db: DbClient;
    userId: string;
    input: createArticleInput;
}

export interface updateArticleStatusParams {
    db: DbClient;
    userId: string;
    articleId: string;
    reviewStatus: ReviewStatusType;
}

export interface deleteArticleParams {
    db: DbClient;
    userId: string;
    articleId: string;
}

export interface importArticleRow {
    title: string;
    pmid?: string;
    authors?: string;
    citation?: string;
    firstAuthor?: string;
    journal?: string;
    publicationYear?: number;
    createDate?: string;
    pmcid?: string;
    nihmsId?: string;
    doi?: string;
}

export interface importArticleOverwrite {
    articleId: string;
    data: importArticleRow;
}

export interface importArticlesParams {
    db: DbClient;
    userId: string;
    projectId: string;
    rows: importArticleRow[];
    overwrites?: importArticleOverwrite[];
}

export interface checkConflictsParams {
    db: DbClient;
    userId: string;
    projectId: string;
    pmids: string[];
}

export interface updateArticleFieldsInput {
    title: string;
    pmid?: string;
    authors?: string;
    citation?: string;
    firstAuthor?: string;
    journal?: string;
    publicationYear?: number;
    createDate?: string;
    pmcid?: string;
    nihmsId?: string;
    doi?: string;
}

export interface updateArticleFieldsParams {
    db: DbClient;
    userId: string;
    articleId: string;
    data: updateArticleFieldsInput;
}
