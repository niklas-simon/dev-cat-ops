// @vitest-environment jsdom
import '@testing-library/jest-dom'; 

import { describe, it, expect, vi, Mock} from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import Page from "@/app/page";
import { getList } from "@/access/cat";

// Mock für `getList`
vi.mock("@/access/cat", () => ({
  getList: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(''),
}));

describe("Page Component", () => {
  it("zeigt die leere Nachricht, wenn `getList` keine Katzen zurückgibt", async () => {
    // `getList` soll ein leeres Array zurückgeben
    (getList as Mock).mockResolvedValue([]);

    render(await Page({ searchParams: Promise.resolve({}) }));

    await waitFor(() => {
      expect(screen.getByText((content) => content.includes("Willkommen beim Katzenspeicher"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("Im Moment ist der Katzenspeicher noch leer und nur Du kannst das ändern."))).toBeInTheDocument();
    });
  });

  it("rendert die `CatCard`-Komponenten, wenn `getList` Katzen zurückgibt", async () => {
    (getList as Mock).mockResolvedValue([
      { id: "1", title: "Miau" },
      { id: "2", title: "Schnurr" },
    ]);

    render(await Page({ searchParams: Promise.resolve({}) }));

     await waitFor(async () => {
      expect(screen.getByText((content) => content.includes("Miau"))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes("Schnurr"))).toBeInTheDocument();
     });
  });
});
