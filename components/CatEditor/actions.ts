"use server";

import path from "path";

import { redirect } from "next/navigation";
import { Cat } from "@prisma/client";

import { update, remove, create } from "@/access/cat";
import { EditorCat } from "@/components/CatEditor/CatEditor";

interface Classification {
    cat_probability: number;
    is_cat: boolean;
}

export async function onSave(
    cat: (Omit<Omit<Cat, "bytes">, "id"> & { id?: string }) | null,
    newCat: EditorCat,
    isNew: boolean,
): Promise<{ [key: string]: string } | undefined> {
    if (!process.env.CLASSIFI_CAT_ION_URL) {
        return {
            form: "environment variable CLASSIFI_CAT_ION_URL is unset but required",
        };
    }

    if (newCat.bytes && newCat.filename) {
        const imageForm = new FormData();

        imageForm.append(
            "file",
            new Blob([new Uint8Array(Buffer.from(newCat.bytes, "base64"))], {
                type: "image/" + path.extname(newCat.filename).substring(1),
            }),
        );

        const classification = await fetch(
            process.env.CLASSIFI_CAT_ION_URL + "/predict",
            {
                method: "POST",
                body: imageForm,
            },
        ).then((res) => res.json() as Promise<Classification>);

        if (!classification.is_cat) {
            return {
                picture: "Das Bild muss eine Katze enthalten",
            };
        }
    }

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
}

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
