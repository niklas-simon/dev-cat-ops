"use client";

import { Button, ButtonProps } from "@heroui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RedirectionButton({
    href,
    ...buttonProps
}: {
    href: string;
} & ButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    return (
        <Link href={href}>
            <Button
                {...buttonProps}
                isLoading={loading}
                onPress={() => {
                    setLoading(true);
                    router.push(href);
                }}
            />
        </Link>
    );
}
