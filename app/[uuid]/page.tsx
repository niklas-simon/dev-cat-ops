"use server";

import { redirect } from "next/navigation";

import { Cat, get } from "@/access/cat";
import CatEditor from "@/components/CatEditor/CatEditor";
import Navigation from "@/components/Navigation";

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

    return (
        <div className="relative flex flex-col w-screen items-center">
            <Navigation />
            <div className="max-w-[1024px] w-full h-full p-4 gap-4 flex items-start justify-center">
                <CatEditor defaultCat={cat} isNew={isNew} />
            </div>
        </div>
    );
}
