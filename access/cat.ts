import { createHash, randomUUID } from "crypto";
import { mkdir, stat, writeFile, rm } from "fs/promises";
import path from "path";

import { Prisma, PrismaClient } from "@prisma/client";

export interface Cat {
    id: string;
    title: string;
    description: string;
    rating: number;
    filename: string;
    bytes?: string;
    hash: string;
}

export type NewCat = Omit<Omit<Cat, "hash">, "id"> & { bytes: string };

export interface SearchFilter {
    search: string;
    rating: number[];
    sort: string;
}

export const uploadFolder =
    process.env.UPLOAD_FOLDER ||
    (process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "uploads")
        : path.join(process.cwd(), "public", "uploads"));

const client = new PrismaClient();

export async function create(cat: NewCat) {
    const hash = createHash("sha256");

    const bytes = new Uint8Array(Buffer.from(cat.bytes, "base64"));

    hash.update(bytes);
    hash.end();
    hash.setEncoding("base64");

    const uuid = randomUUID();

    const filename = uuid + "_" + cat.filename;

    try {
        const stats = await stat(uploadFolder);

        if (!stats.isDirectory()) {
            throw new Error();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
        await mkdir(uploadFolder, { recursive: true });
    }
    await writeFile(path.join(uploadFolder, filename), bytes);

    const dbCat = await client.cat.create({
        data: {
            title: cat.title,
            description: cat.description,
            rating: cat.rating,
            id: uuid,
            hash: hash.read(),
            filename: filename,
        },
    });

    return dbCat.id;
}

export async function get(id: string): Promise<Omit<Cat, "bytes"> | null> {
    const dbCat = await client.cat.findFirst({
        where: { id },
    });

    if (!dbCat) {
        return null;
    }

    return { ...dbCat };
}

export async function update(cat: Cat) {
    if (!cat.id) {
        return;
    }

    const dbCat = await get(cat.id);

    if (!dbCat) {
        return;
    }

    const hash = createHash("sha256");

    let hashStr, filename;

    if (cat.bytes) {
        const bytes = new Uint8Array(Buffer.from(cat.bytes, "base64"));

        hash.update(bytes);
        hash.end();
        hash.setEncoding("base64");

        hashStr = hash.read();

        filename = dbCat.id + "_" + cat.filename;

        if (dbCat.hash !== hashStr) {
            await rm(path.join(uploadFolder, dbCat.filename));
            await writeFile(path.join(uploadFolder, filename), bytes);
        }
    }

    await client.cat.update({
        where: {
            id: cat.id,
        },
        data: {
            title: cat.title,
            description: cat.description,
            rating: cat.rating,
            filename: cat.bytes ? filename : dbCat.filename,
            hash: cat.bytes ? hashStr : dbCat.hash,
        },
    });
}

export async function getList(filter: SearchFilter) {
    const filters: Prisma.CatWhereInput[] = [];

    if (filter.search) {
        filters.push({
            OR: [
                {
                    title: {
                        contains: filter.search,
                    },
                },
                {
                    description: {
                        contains: filter.search,
                    },
                },
            ],
        });
    }

    if (filter.rating) {
        filters.push(
            {
                rating: {
                    gte: filter.rating[0],
                },
            },
            {
                rating: {
                    lte: filter.rating[1],
                },
            },
        );
    }

    let orderBy: Prisma.CatOrderByWithRelationInput | undefined = undefined;

    switch (filter.sort) {
        case "alpha_asc":
            orderBy = {
                title: "asc",
            };
            break;
        case "alpha_desc":
            orderBy = {
                title: "desc",
            };
            break;
        case "rating_asc":
            orderBy = {
                rating: "asc",
            };
            break;
        case "rating_desc":
            orderBy = {
                rating: "desc",
            };
            break;
    }

    return client.cat.findMany({
        where:
            filters.length === 1
                ? filters[0]
                : {
                      AND: filters,
                  },
        orderBy,
    });
}

export async function remove(id: string) {
    await client.cat.delete({
        where: { id },
    });
}
