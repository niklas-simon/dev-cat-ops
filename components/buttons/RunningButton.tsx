import { Button, ButtonProps } from "@heroui/button";
import { CircularProgress } from "@heroui/progress";
import { useEffect, useState } from "react";

const runDistance = 75;

export default function RunningButton({
    delay,
    ...buttonProps
}: { delay: number } & ButtonProps) {
    const [delayed, setDelayed] = useState(true);
    const [startTime] = useState(new Date().getTime());
    const [remaining, setRemaining] = useState(delay);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const i = setInterval(() => {
            setRemaining(delay - (new Date().getTime() - startTime));
        }, 50);
        const t = setTimeout(() => {
            setDelayed(false);
            clearInterval(i);
            setPos({ x: 0, y: 0 });
        }, delay);

        return () => {
            clearTimeout(t);
            clearInterval(i);
        };
    }, [delay, startTime]);

    return (
        <Button
            {...buttonProps}
            isDisabled={delayed}
            style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                pointerEvents: "all",
                transition: "100ms",
            }}
            onMouseOver={() => {
                if (!delayed) {
                    return;
                }

                const rand = Math.random();

                setPos({
                    x: rand * runDistance * (pos.x > 0 ? -1 : 1),
                    y:
                        Math.sqrt(1 - rand * rand) *
                        runDistance *
                        (pos.y > 0 ? -1 : 1),
                });
            }}
            onPress={(e) => {
                if (delayed) {
                    return;
                }

                buttonProps.onPress?.(e);
            }}
        >
            {delayed ? (
                <CircularProgress
                    disableAnimation
                    showValueLabel
                    value={Math.round((remaining * 100) / delay)}
                    valueLabel={`(${Math.ceil(remaining / 1000)})`}
                />
            ) : (
                buttonProps.children
            )}
        </Button>
    );
}
