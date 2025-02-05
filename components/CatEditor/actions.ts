"use server";

import path from "path";

import { redirect } from "next/navigation";

import { update, remove, create } from "@/access/cat";
import { EditorCat } from "@/components/CatEditor/CatEditor";
import Cat from "@/entity/Cat";

export const onSave = async (
    cat: (Omit<Omit<Cat, "bytes">, "id"> & { id?: string }) | null,
    newCat: EditorCat,
    isNew: boolean,
) => {
    if (isNew) {
        if (!newCat.bytes || !newCat.filename) {
            return;
        }
        const id = await create({
            ...newCat,
            filename: newCat.filename,
            bytes: newCat.bytes,
        });

        redirect("/" + id);
    } else {
        await update(Object.assign(cat!, newCat) as Cat);
    }
};

export const onDelete = async (id: string) => {
    await remove(id);
    redirect("/");
};

export const cloudImport = async () => {
    const searchRes = await fetch("https://api.thecatapi.com/v1/images/search");
    const search = await searchRes.json();
    const imageRes = await fetch(search[0].url);

    return {
        title: search[0].id,
        description: "Importiert von thecatapi.com",
        filename: path.basename(search[0].url),
        bytes: Buffer.from(await imageRes.arrayBuffer()).toString("base64"),
    };
};
