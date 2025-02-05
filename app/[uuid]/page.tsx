"use server";

import { redirect } from "next/navigation";

import { Cat, get } from "@/access/cat";
import CatEditor from "@/components/CatEditor/CatEditor";

export default async function Page({
    params,
}: {
    params: Promise<{ uuid: string }>;
}) {
    const uuid = (await params).uuid;
    const isNew = uuid === "new";

    let cat: (Omit<Omit<Cat, "bytes">, "id"> & { id?: string }) | null = null;

    if (!isNew) {
        cat = await get(uuid);
        if (!cat) {
            redirect("/404");
        }
    }

    return <CatEditor defaultCat={cat} isNew={isNew} />;
}
