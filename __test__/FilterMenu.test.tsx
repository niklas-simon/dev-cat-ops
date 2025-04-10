import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import FilterMenu from "../components/FilterMenu/FilterMenu"; // Adjust this path accordingly

// --- Mocks for Next Navigation ---
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    // Provide default search parameters (simulate empty query params)
    useSearchParams: () =>
        new URLSearchParams("search=&minRating=&maxRating=&sort="),
}));

// For the purpose of our tests, we assume the default filter values are:
const defaultFilter = {
    search: "",
    rating: [1, 10],
    sort: "alpha_asc",
};

describe("FilterMenu", () => {
    // Helper: Reset mocks between tests if necessary.
    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders filter trigger button", () => {
        render(<FilterMenu />);
        // Expect at least one button is rendered (the trigger button)
        const triggerButton = screen.getByRole("button");

        expect(triggerButton).toBeInTheDocument();
    });

    it("opens filter menu when trigger is clicked", async () => {
        render(<FilterMenu />);
        const triggerButton = screen.getByRole("button");

        // Simulate click on the trigger to open the popover
        userEvent.click(triggerButton);
        // Wait for the input labeled "Suchbegriff" to appear in the popover content
        await waitFor(() => {
            expect(screen.getByLabelText(/Suchbegriff/i)).toBeInTheDocument();
        });
    });

    it("calls router.push with default filter when clear button is pressed", async () => {
        render(<FilterMenu />);
        // Open the popover
        const triggerButton = screen.getByRole("button");

        userEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/Suchbegriff/i)).toBeInTheDocument();
        });

        // In your FilterMenu, the clear button is rendered as a PromiseButton with the <X /> icon.
        // We locate it by checking for a button whose innerHTML includes "X".
        const clearButton = screen.getByTestId("clear-button");

        expect(clearButton).toBeDefined();
        if (clearButton) {
            userEvent.click(clearButton);
        }

        await waitFor(() => {
            // The clear button calls applyFilter with defaultFilter.
            const expectedUrl = `/?search=${defaultFilter.search}&minRating=${defaultFilter.rating[0]}&maxRating=${defaultFilter.rating[1]}&sort=${defaultFilter.sort}`;

            expect(mockPush).toHaveBeenCalledWith(encodeURI(expectedUrl));
        });
    });

    it("calls router.push with applied filter when apply button is pressed", async () => {
        render(<FilterMenu />);
        // Open the popover
        const triggerButton = screen.getByRole("button");

        userEvent.click(triggerButton);

        await waitFor(() => {
            expect(screen.getByLabelText(/Suchbegriff/i)).toBeInTheDocument();
        });

        // Change the search input value.
        const searchInput = screen.getByLabelText(/Suchbegriff/i);

        userEvent.clear(searchInput);
        await userEvent.type(searchInput, "kitten");

        // In this example, we assume the slider and select remain with default values.
        // Now locate the apply button: it is the PromiseButton with the Filter icon.
        // We try to pick the button whose innerHTML includes "Filter" but not "X".
        const applyButton = screen.getByTestId("apply-button");

        expect(applyButton).toBeDefined();
        if (applyButton) {
            userEvent.click(applyButton);
        }

        await waitFor(() => {
            const expectedUrl = `/?search=kitten&minRating=${defaultFilter.rating[0]}&maxRating=${defaultFilter.rating[1]}&sort=${defaultFilter.sort}`;

            expect(mockPush).toHaveBeenCalledWith(encodeURI(expectedUrl));
        });
    });
});
