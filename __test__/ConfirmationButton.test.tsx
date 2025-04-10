import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import ConfirmationButton from "../components/buttons/ConfirmationButton";

// Mock RunningButton component to avoid delay issues
vi.mock("../RunningButton", () => ({
    default: ({
        children,
        onPress,
    }: {
        children: React.ReactNode;
        onPress: () => void;
    }) => (
        <button data-testid="running-button" onClick={onPress}>
            {children}
        </button>
    ),
}));

describe("ConfirmationButton", () => {
    it("renders the button and opens the modal on click", () => {
        render(
            <ConfirmationButton
                description="Are you sure?"
                title="Confirm Action"
                onConfirm={vi.fn()}
            />,
        );

        const button = screen.getByRole("button");

        expect(button).toBeInTheDocument();

        // Click the button to open the modal
        fireEvent.click(button);

        // Check if modal elements appear
        expect(screen.getByText("Confirm Action")).toBeInTheDocument();
        expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    });

    it("calls onConfirm when the confirm button is clicked", async () => {
        const onConfirmMock = vi.fn();

        render(
            <ConfirmationButton
                description="Are you sure?"
                title="Confirm Action"
                onConfirm={onConfirmMock}
            />,
        );

        fireEvent.click(screen.getByRole("button"));

        const confirmButton = screen.getByTestId("confirm-button");

        // Wait for the 3-second delay (button should become enabled)
        await waitFor(() => expect(confirmButton).not.toBeDisabled(), {
            timeout: 4000, // longer than 3s to ensure stability
        });
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(onConfirmMock).toHaveBeenCalled();
        });
    });

    it("closes the modal when the cancel button is clicked", () => {
        render(
            <ConfirmationButton
                description="Are you sure?"
                title="Confirm Action"
                onConfirm={vi.fn()}
            />,
        );

        fireEvent.click(screen.getByRole("button"));

        const cancelButton = screen.getByTestId("cancel-button");

        fireEvent.click(cancelButton);

        expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
    });
});
