import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Navbar, NavbarBrand, NavbarContent } from "@heroui/navbar";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Plus } from "react-feather";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
    title: {
        default: "Katzenspeicher",
        template: `Katzenspeicher | %s`,
    },
    description: "Speichert hier Eure liebsten Katzenbilder",
    icons: {
        icon: "/favicon.ico",
    },
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />
            <body
                className={clsx(
                    "h-screen w-screen overflow-hidden bg-background font-sans antialiased flex",
                    fontSans.variable,
                )}
            >
                <Providers
                    themeProps={{ attribute: "class", defaultTheme: "dark" }}
                >
                    <div className="relative flex flex-col w-screen items-center">
                        <Navbar isBordered>
                            <Link href="/">
                                <NavbarBrand className="gap-4">
                                    <Image
                                        alt="Icon"
                                        height={48}
                                        src="/icon.png"
                                        width={48}
                                    />
                                    <span className="text-xl hidden xs:inline">
                                        Katzenspeicher
                                    </span>
                                </NavbarBrand>
                            </Link>
                            <NavbarContent justify="end">
                                <Link href="/new">
                                    <Button isIconOnly color="primary">
                                        <Plus />
                                    </Button>
                                </Link>
                            </NavbarContent>
                        </Navbar>
                        <div className="max-w-[1024px] w-full h-full p-4 gap-4 flex items-start justify-center">
                            {children}
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
