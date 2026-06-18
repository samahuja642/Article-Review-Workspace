import { TRPCError } from "@trpc/server";
import type {
    getArticlesByProjectParams,
    createArticleParams,
    updateArticleStatusParams,
    deleteArticleParams,
    importArticlesParams,
    checkConflictsParams,
    updateArticleFieldsParams,
} from "../types/article";

async function assertProjectMember(db: getArticlesByProjectParams["db"], userId: string, projectId: string) {
    const member = await db.projectMember.findFirst({ where: { userId, projectId } });
    if (!member) throw new TRPCError({ code: "FORBIDDEN", message: "You are not a member of this project." });
    return member;
}

function rowToData(row: importArticlesParams["rows"][number], projectId: string) {
    return {
        projectId,
        title: row.title,
        pmid: row.pmid ?? null,
        authors: row.authors ?? null,
        citation: row.citation ?? null,
        firstAuthor: row.firstAuthor ?? null,
        journal: row.journal ?? null,
        publicationYear: row.publicationYear ?? null,
        createDate: row.createDate ? new Date(row.createDate) : null,
        pmcid: row.pmcid ?? null,
        nihmsId: row.nihmsId ?? null,
        doi: row.doi ?? null,
    };
}

export async function getArticlesByProject({
    db,
    userId,
    projectId,
    cursor,
    limit = 20,
    search,
    reviewStatus,
}: getArticlesByProjectParams) {
    await assertProjectMember(db, userId, projectId);

    const rows = await db.article.findMany({
        where: {
            projectId,
            ...(reviewStatus ? { reviewStatus } : {}),
            ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
    });

    let nextCursor: string | undefined = undefined;
    if (rows.length > limit) {
        const next = rows.pop();
        nextCursor = next!.id;
    }

    return { items: rows, nextCursor };
}

export async function createArticle({ db, userId, input }: createArticleParams) {
    await assertProjectMember(db, userId, input.projectId);

    return db.article.create({
        data: {
            projectId: input.projectId,
            title: input.title,
            pmid: input.pmid ?? null,
            authors: input.authors ?? null,
            journal: input.journal ?? null,
            publicationYear: input.publicationYear ?? null,
            doi: input.doi ?? null,
            pmcid: input.pmcid ?? null,
        },
    });
}

export async function updateArticleStatus({ db, userId, articleId, reviewStatus }: updateArticleStatusParams) {
    const article = await db.article.findUnique({ where: { id: articleId } });
    if (!article) throw new TRPCError({ code: "NOT_FOUND" });

    await assertProjectMember(db, userId, article.projectId);

    return db.article.update({ where: { id: articleId }, data: { reviewStatus } });
}

export async function deleteArticle({ db, userId, articleId }: deleteArticleParams) {
    const article = await db.article.findUnique({ where: { id: articleId } });
    if (!article) throw new TRPCError({ code: "NOT_FOUND" });

    await assertProjectMember(db, userId, article.projectId);

    return db.article.delete({ where: { id: articleId } });
}

export async function checkConflicts({ db, userId, projectId, pmids }: checkConflictsParams) {
    await assertProjectMember(db, userId, projectId);

    const existing = await db.article.findMany({
        where: { projectId, pmid: { in: pmids } },
        select: { id: true, pmid: true, title: true, authors: true, journal: true, publicationYear: true, doi: true, version: true },
    });

    return existing;
}

export async function updateArticleFields({ db, userId, articleId, data }: updateArticleFieldsParams) {
    const article = await db.article.findUnique({ where: { id: articleId } });
    if (!article) throw new TRPCError({ code: "NOT_FOUND" });

    await assertProjectMember(db, userId, article.projectId);

    return db.article.update({
        where: { id: articleId },
        data: {
            title: data.title,
            pmid: data.pmid ?? null,
            authors: data.authors ?? null,
            citation: data.citation ?? null,
            firstAuthor: data.firstAuthor ?? null,
            journal: data.journal ?? null,
            publicationYear: data.publicationYear ?? null,
            createDate: data.createDate ? new Date(data.createDate) : null,
            pmcid: data.pmcid ?? null,
            nihmsId: data.nihmsId ?? null,
            doi: data.doi ?? null,
        },
    });
}

type ConflictExisting = {
    id: string; pmid: string | null; title: string;
    authors: string | null; journal: string | null;
    publicationYear: number | null; doi: string | null; version: number;
};
type ConflictInfo = { incomingRow: importArticlesParams["rows"][number]; existing: ConflictExisting };

export async function importArticles({ db, userId, projectId, rows, overwrites }: importArticlesParams) {
    await assertProjectMember(db, userId, projectId);

    // Second-pass: conflict resolutions provided — apply overwrites and create keep_both rows
    if (overwrites !== undefined) {
        let updated = 0;
        const staleOverwrites: typeof overwrites[number][] = [];
        for (const o of overwrites) {
            const result = await db.article.updateMany({
                where: { id: o.articleId, version: o.version },
                data: { ...rowToData(o.data, projectId), version: { increment: 1 } },
            });
            if (result.count === 0) staleOverwrites.push(o);
            else updated++;
        }

        let created = 0;
        if (rows.length > 0) {
            const result = await db.article.createMany({ data: rows.map((r) => rowToData(r, projectId)) });
            created = result.count;
        }

        const staleConflicts: ConflictInfo[] = staleOverwrites.length > 0
            ? (await db.article.findMany({
                where: { id: { in: staleOverwrites.map((o) => o.articleId) } },
                select: { id: true, pmid: true, title: true, authors: true, journal: true, publicationYear: true, doi: true, version: true },
            })).map((existing) => ({
                existing,
                incomingRow: staleOverwrites.find((o) => o.articleId === existing.id)!.data,
            }))
            : [];

        return { created, updated, conflicts: [] as ConflictInfo[], blankPmidRows: [] as importArticlesParams["rows"], staleConflicts };
    }

    // First-pass: detect conflicts, import non-conflicting rows immediately
    const withPmid = rows.filter((r) => !!r.pmid);
    const noPmid = rows.filter((r) => !r.pmid);
    const pmids = withPmid.map((r) => r.pmid!);

    const existingByPmid: ConflictExisting[] = pmids.length > 0
        ? await db.article.findMany({
            where: { projectId, pmid: { in: pmids } },
            select: { id: true, pmid: true, title: true, authors: true, journal: true, publicationYear: true, doi: true, version: true },
        })
        : [];

    const existingPmidSet = new Set(existingByPmid.map((e) => e.pmid));
    const nonConflicting = withPmid.filter((r) => !existingPmidSet.has(r.pmid!));
    const conflicting = withPmid.filter((r) => existingPmidSet.has(r.pmid!));

    // Deduplicate non-conflicting rows by PMID: only create the first occurrence per PMID.
    // Extra rows with the same new PMID become intra-batch conflicts against the just-created article.
    const nonConflictingByPmid = new Map<string, (typeof nonConflicting)[number][]>();
    for (const row of nonConflicting) {
        const pmid = row.pmid!;
        if (!nonConflictingByPmid.has(pmid)) nonConflictingByPmid.set(pmid, []);
        nonConflictingByPmid.get(pmid)!.push(row);
    }
    const toCreate = [...nonConflictingByPmid.values()].map((rows) => rows[0]!);
    const intraBatchDupes = [...nonConflictingByPmid.values()].flatMap((rows) => rows.slice(1));

    let created = 0;
    if (toCreate.length > 0) {
        const result = await db.article.createMany({ data: toCreate.map((r) => rowToData(r, projectId)) });
        created = result.count;
    }

    // Build conflict list: DB conflicts + intra-batch duplicates
    const dbConflicts: ConflictInfo[] = conflicting.map((incomingRow) => ({
        incomingRow,
        existing: existingByPmid.find((e) => e.pmid === incomingRow.pmid)!,
    }));

    let intraConflicts: ConflictInfo[] = [];
    if (intraBatchDupes.length > 0) {
        const dupePmids = [...new Set(intraBatchDupes.map((r) => r.pmid!))];
        const justCreated = await db.article.findMany({
            where: { projectId, pmid: { in: dupePmids } },
            select: { id: true, pmid: true, title: true, authors: true, journal: true, publicationYear: true, doi: true, version: true },
        });
        const justCreatedByPmid = new Map(justCreated.map((a) => [a.pmid, a]));
        intraConflicts = intraBatchDupes.map((incomingRow) => ({
            incomingRow,
            existing: justCreatedByPmid.get(incomingRow.pmid!)!,
        }));
    }

    const conflicts: ConflictInfo[] = [...dbConflicts, ...intraConflicts];

    // Return blank-PMID rows separately so the frontend can let the user review/edit them
    return { created, updated: 0, conflicts, blankPmidRows: noPmid, staleConflicts: [] as ConflictInfo[] };
}
