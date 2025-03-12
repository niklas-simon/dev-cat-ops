import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import Link from "next/link";

import CatCard from "@/components/CatCard";
import { getList } from "@/access/cat";
import Navigation from "@/components/Navigation";
import { defaultFilter } from "@/components/FilterMenu/defaults";

export const dynamic = "force-dynamic";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        minRating?: string;
        maxRating?: string;
        sort?: string;
    }>;
}) {
    const search = await searchParams;

    const filter = {
        search: search.search || defaultFilter.search,
        rating: [
            Number(search.minRating) || defaultFilter.rating[0],
            Number(search.maxRating) || defaultFilter.rating[1],
        ],
        sort: search.sort || defaultFilter.sort,
    };

    const list = await getList(filter);

    return (
        <div className="relative flex flex-col w-screen items-center">
            <Navigation showFilter />
            <div className="max-w-[1024px] w-full h-full p-4 gap-4 flex items-start justify-center">
                <div className="flex flex-wrap flex-row gap-4 flex-1 justify-center">
                    {list.length ? (
                        await Promise.all(
                            list.map(async (cat) => {
                                return <CatCard key={cat.id} cat={cat} />;
                            }),
                        )
                    ) : filter.search !== defaultFilter.search &&
                      filter.rating[0] !== defaultFilter.rating[0] &&
                      filter.rating[1] !== defaultFilter.rating[1] ? (
                        <Card>
                            <CardBody>
                                Mit den aktuellen Filtereinstellungen konnten
                                keine Katzenbilder gefunden werden
                            </CardBody>
                        </Card>
                    ) : (
                        <Card className="max-w-[420px]">
                            <CardHeader>
                                <h1 className="text-xl">
                                    Willkommen beim Katzenspeicher
                                </h1>
                            </CardHeader>
                            <CardBody>
                                Im Moment ist der Katzenspeicher noch leer und
                                nur Du kannst das ändern. Gib deinen liebsten
                                Katzenbildern ein Zuhause im Katzenspeicher.
                            </CardBody>
                            <CardFooter className="justify-center">
                                <Link href="/new">
                                    <Button color="primary">
                                        Katzenbild hochladen
                                    </Button>
                                </Link>
                            </CardFooter>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
