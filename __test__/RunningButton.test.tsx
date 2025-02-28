// @vitest-environment jsdom
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RunningButton from "../components/buttons/RunningButton";
import { describe, expect, it, test, vi } from "vitest";

describe("RunningButton", () => {
    it("renders the button with initial state", () => {
        render(<RunningButton delay={2000}>Click Me</RunningButton>);
        
        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(screen.getByText("(2)")).toBeInTheDocument(); // Progress label
    });

    it("button enables after delay", async () => {
        render(<RunningButton delay={1000}>Click Me</RunningButton>);

        await waitFor(
            () => {
                expect(screen.getByRole("button")).not.toBeDisabled();
            },
            { timeout: 1500 } // Ensuring it waits for state update
        );
    });

    it("displays correct progress countdown", async () => {
        render(<RunningButton delay={3000}>Click Me</RunningButton>);

        await waitFor(() => {
            expect(screen.getByText("(3)")).toBeInTheDocument();
        }, { timeout: 1500 });

        await waitFor(() => {
            expect(screen.getByText("(2)")).toBeInTheDocument();
        }, { timeout: 1500 });

        await waitFor(() => {
            expect(screen.getByText("(1)")).toBeInTheDocument();
        }, { timeout: 1000 });
    });

    it("moves when hovered while disabled", async () => {
        render(<RunningButton delay={5000}>Click Me</RunningButton>);
        const button = screen.getByRole("button");

        const initialStyle = button.style.transform;
        fireEvent.mouseOver(button);

        await waitFor(() => {
            expect(button.style.transform).not.toBe(initialStyle);
        }, { timeout: 500 });
    });

    it("calls onPress when clicked after delay", async () => {
        const mockPress = vi.fn();
        render(
            <RunningButton delay={1000} onPress={mockPress}>
                Click Me
            </RunningButton>
        );

        await waitFor(() => {
            expect(screen.getByRole("button")).not.toBeDisabled();
        }, { timeout: 1500 });

        userEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(mockPress).toHaveBeenCalled();
        });
       });
});
