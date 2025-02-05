import { Button } from "@heroui/button";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
import { Plus } from "react-feather";
import Image from "next/image";
import Link from "next/link";

import FilterMenu from "./FilterMenu/FilterMenu";

export default function Navigation({ showFilter }: { showFilter?: boolean }) {
    return (
        <Navbar isBordered>
            <Link href="/">
                <NavbarBrand className="gap-4">
                    <Image alt="Icon" height={48} src="/icon.png" width={48} />
                    <span className="text-xl hidden xs:inline">
                        Katzenspeicher
                    </span>
                </NavbarBrand>
            </Link>
            <NavbarContent justify="end">
                {showFilter && <FilterMenu />}
                <Link href="/new">
                    <Button isIconOnly color="primary">
                        <Plus />
                    </Button>
                </Link>
            </NavbarContent>
        </Navbar>
    );
}
