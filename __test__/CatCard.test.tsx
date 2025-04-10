import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import CatCard from "../components/CatCard";

describe("CatCard Component", () => {
    const catData = {
        id: "1",
        title: "Miau",
        description: "A cute cat",
        rating: 5,
        filename: "cat.jpg",
        bytes: "dummybase64data", // example data
    };

    it("renders CatCard with image when filename is provided", () => {
        render(<CatCard cat={catData} />);

        // check if title is rendered
        expect(screen.getByText("Miau")).toBeInTheDocument();

        // check if rating "5/10" is rendered
        expect(screen.getByText(/5\/10/i)).toBeInTheDocument();

        // check if link is rendered with correct href
        const link = screen.getByRole("link");

        expect(link).toHaveAttribute("href", "/1");

        // check if image is rendered with correct alt text
        const image = screen.getByAltText("cat.jpg");

        expect(image).toBeInTheDocument();
    });

    it("renders placeholder when filename is not provided", () => {
        // create data without image
        const catDataNoImage = {
            ...catData,
            filename: undefined,
            bytes: undefined,
        };

        render(<CatCard cat={catDataNoImage} />);

        // title has to be rendered
        expect(screen.getByText("Miau")).toBeInTheDocument();

        // there should be no image
        expect(screen.queryByRole("img")).not.toBeInTheDocument();

        // look for placeholder div by class (Tailwind classes contain special characters that need to be escaped)
        const placeholder = document.querySelector(
            "div.w-\\[256px\\].h-\\[256px\\]",
        );

        expect(placeholder).toBeInTheDocument();
    });

    it("applies nonInteractive prop correctly", () => {
        render(<CatCard cat={catData} nonInteractive={true} />);

        // Check whether the link contains the class “pointer-events-none”
        const link = screen.getByRole("link");

        expect(link).toHaveClass("pointer-events-none");
    });
});
