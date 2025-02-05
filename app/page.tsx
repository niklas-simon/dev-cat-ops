import { readFile } from "fs/promises";
import path from "path";

import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import Link from "next/link";

import CatCard from "@/components/CatCard";
import { getList, uploadFolder } from "@/access/cat";

export default async function Home() {
    const list = await getList();

    if (!list.length) {
        return (
            <Card className="max-w-[420px]">
                <CardHeader>
                    <h1 className="text-xl">Wilkommen beim Katzenspeicher</h1>
                </CardHeader>
                <CardBody>
                    Im Moment ist der Katzenspeicher noch leer und nur Du kannst
                    das ändern. Gib deinen liebsten Katzenbildern ein Zuhause im
                    Katzenspeicher.
                </CardBody>
                <CardFooter className="justify-center">
                    <Link href="/new">
                        <Button color="primary">Katzenbild hochladen</Button>
                    </Link>
                </CardFooter>
            </Card>
        );
    }

    return (
        <div className="flex flex-wrap flex-row gap-4 flex-1 justify-center">
            {await Promise.all(
                list.map(async (cat) => {
                    const buffer = await readFile(
                        path.join(uploadFolder, cat.filename),
                    );

                    return (
                        <CatCard
                            key={cat.id}
                            cat={{ ...cat, bytes: buffer.toString("base64") }}
                        />
                    );
                }),
            )}
        </div>
    );
}
