import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CatEditor from "../components/CatEditor/CatEditor";

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
}));

describe("CatEditor", () => {
    const defaultCat = null;
    const isNew = true;

    it("renders form with initial values", () => {
        render(<CatEditor defaultCat={defaultCat} isNew={isNew} />);
        // The header should indicate an upload (hochladen) when isNew is true
        expect(screen.getByText(/Katzenbild hochladen/i)).toBeInTheDocument();

        // Check for input fields by their labels
        expect(screen.getByLabelText(/Titel/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Beschreibung/i)).toBeInTheDocument();
        expect(screen.getByTestId("rating-slider")).toBeInTheDocument();
        expect(screen.getByLabelText(/Katzenbild/i)).toBeInTheDocument();
    });

    it("shows error when saving without title", async () => {
        render(<CatEditor defaultCat={defaultCat} isNew={isNew} />);

        // The save button is a PromiseButton rendered as the last button in the CardFooter.
        // We retrieve all buttons and pick the last one.
        const buttons = screen.getAllByRole("button");
        const saveButton = buttons[buttons.length - 1];

        // Click the Save button with an empty title
        userEvent.click(saveButton);

        // Expect an error message regarding the missing title.
        await waitFor(() => {
            expect(
                screen.getByText(/Bitte gib deinem Bild einen Titel/i),
            ).toBeInTheDocument();
        });
    });
});
