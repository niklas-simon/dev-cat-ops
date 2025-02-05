import { createHash, randomUUID } from "crypto";
import { mkdir, stat, writeFile, rm } from "fs/promises";
import path from "path";

import { getDataSource } from "@/data-source";
import DBCat from "@/entity/Cat";

export interface Cat {
    id: string;
    title: string;
    description: string;
    rating: number;
    filename: string;
    bytes?: string;
    hash: string;
    created: Date;
    updated: Date;
}

export type NewCat = Omit<
    Omit<Omit<Omit<Cat, "hash">, "id">, "created">,
    "updated"
> & { bytes: string };

export const uploadFolder =
    process.env.UPLOAD_FOLDER ||
    (process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "uploads")
        : path.join(process.cwd(), "public", "uploads"));

async function getRepo() {
    const ds = await getDataSource();

    return ds.getRepository(DBCat);
}

export async function create(cat: NewCat) {
    const catRepo = await getRepo();

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

    const dbCat = await catRepo.save({
        ...cat,
        id: uuid,
        hash: hash.read(),
        filename: filename,
    });

    return dbCat.id;
}

export async function get(id: string): Promise<Omit<Cat, "bytes"> | null> {
    const catRepo = await getRepo();
    const dbCat = await catRepo.findOneBy({ id });

    if (!dbCat) {
        return null;
    }

    return { ...dbCat };
}

export async function update(cat: Cat) {
    if (!cat.id) {
        return;
    }

    const catRepo = await getRepo();

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

        const hashStr = hash.read();

        const filename = dbCat.id + "_" + cat.filename;

        if (dbCat.hash !== hashStr) {
            await rm(path.join(uploadFolder, dbCat.filename));
            await writeFile(path.join(uploadFolder, filename), bytes);
        }
    }

    await catRepo.update(cat.id, {
        title: cat.title,
        description: cat.description,
        rating: cat.rating,
        filename: cat.bytes ? filename : dbCat.filename,
        hash: cat.bytes ? hashStr : dbCat.hash,
    });
}

export async function getList() {
    const catRepo = await getRepo();

    return catRepo.find();
}

export async function remove(id: string) {
    const catRepo = await getRepo();

    await catRepo.delete({ id });
}
