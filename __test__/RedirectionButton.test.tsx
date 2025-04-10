import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import RedirectionButton from "../components/buttons/RedirectionButton";

// Mock next/navigation to control useRouter
const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

describe("RedirectionButton", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders the button with its children", () => {
        render(
            <RedirectionButton color="primary" href="/test-path">
                Click me
            </RedirectionButton>,
        );

        // Check that the button is rendered with the expected text
        const button = screen.getByRole("button");

        expect(button).toBeInTheDocument();
        expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("calls router.push with the correct href when pressed", () => {
        render(
            <RedirectionButton color="primary" href="/test-path">
                Click me
            </RedirectionButton>,
        );

        // Simulate a click on the button
        const button = screen.getByRole("button");

        fireEvent.click(button);

        // Verify that the router's push method was called with "/test-path"
        expect(pushMock).toHaveBeenCalledWith("/test-path");
    });
});
