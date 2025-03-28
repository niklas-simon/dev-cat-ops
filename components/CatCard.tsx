import path from "path";

import { Card, CardHeader, CardBody } from "@heroui/card";
import Image from "next/image";
import Link from "next/link";

import { EditorCat } from "./CatEditor/CatEditor";
import Paw from "./icons/Paw";

export default function CatCard({
    cat,
    nonInteractive,
}: {
    cat: EditorCat & { id?: string };
    nonInteractive?: boolean;
}) {
    return (
        <Link
            className={nonInteractive ? "pointer-events-none" : ""}
            href={`/${cat.id}`}
        >
            <Card className="hover:bg-default-100 flex-1">
                <CardHeader className="flex flex-row justify-between gap-4 w-full">
                    <span>{cat.title}</span>
                    <div className="flex flex-row gap-1 items-center">
                        <Paw
                            className="text-yellow-500 fill-yellow-500"
                            size={16}
                        />
                        {cat.rating}/10
                    </div>
                </CardHeader>
                <CardBody>
                    {cat.filename ? (
                        <Image
                            alt={cat.filename}
                            className="object-contain aspect-square w-[256px] h-[256px]"
                            height={256}
                            src={
                                cat.bytes
                                    ? `data:image/${path.extname(cat.filename).substring(1)};base64,${cat.bytes}`
                                    : "/images/" + cat.filename
                            }
                            width={256}
                        />
                    ) : (
                        <div className="w-[256px] h-[256px]" />
                    )}
                </CardBody>
            </Card>
        </Link>
    );
}
