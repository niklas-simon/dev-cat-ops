"use client";

import { Button, ButtonProps } from "@heroui/button";
import { useEffect, useState } from "react";
import { Check, X } from "react-feather";

const holdResult = 1000;

export default function PromiseButton({
    onPress,
    ...buttonProps
}: {
    onPress: () => Promise<void>;
} & Omit<ButtonProps, "onPress">) {
    const [loading, isLoading] = useState(false);
    const [success, setSuccess] = useState<boolean | null>(null);

    useEffect(() => {
        if (success === null) {
            return;
        }

        const t = setTimeout(() => setSuccess(null), holdResult);

        return () => clearTimeout(t);
    }, [success]);

    return (
        <Button
            {...buttonProps}
            className={`transition ${buttonProps.className}`}
            color={
                success === null
                    ? buttonProps.color
                    : success
                      ? "success"
                      : "danger"
            }
            isLoading={loading}
            onPress={async () => {
                isLoading(true);
                try {
                    await onPress();
                    setSuccess(true);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (_e) {
                    setSuccess(false);
                } finally {
                    isLoading(false);
                }
            }}
        >
            {success === null ? (
                buttonProps.children
            ) : success ? (
                <Check data-testid="success-icon" />
            ) : (
                <X />
            )}
        </Button>
    );
}
