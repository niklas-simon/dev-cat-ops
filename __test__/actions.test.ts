// @vitest-environment node

import { describe, it, expect, vi, beforeEach, afterEach, Mock } from "vitest";
import { onSave, onDelete, cloudImport } from "../components/CatEditor/actions";
import { create, update, remove } from "@/access/cat";
import { redirect } from "next/navigation";
import path from "path";

// Mock dependencies
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/access/cat", () => ({
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
}));

describe("onSave", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not call create or redirect if newCat lacks bytes or filename", async () => {
    await onSave(null, { title: "", description: "", rating: 0, bytes: "", filename: "" }, true);
    expect(create).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("should call create and redirect for a new cat with valid data", async () => {
    const newCat = { title: "New Cat", description: "A new cat", rating: 5, bytes: "data", filename: "cat.jpg" };
    (create as Mock).mockResolvedValue("new-id");

    await onSave(null, newCat, true);

    expect(create).toHaveBeenCalledWith(newCat);
    expect(redirect).toHaveBeenCalledWith("/new-id");
  });

  it("should call update for an existing cat", async () => {
    const existingCat = { id: "1", title: "Old Title", description: "Old Description", rating: 5, hash: "oldhash", bytes: "old", filename: "old.jpg" };
    const newCat = { title: "New Title", description: "New Description", rating: 5, bytes: "new", filename: "new.jpg" };

    await onSave(existingCat, newCat, false);

    expect(update).toHaveBeenCalledWith({ ...existingCat, ...newCat });
  });
});

describe("onDelete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call remove and redirect", async () => {
    await onDelete("cat-id");
    expect(remove).toHaveBeenCalledWith("cat-id");
    expect(redirect).toHaveBeenCalledWith("/");
  });
});

describe("cloudImport", () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    originalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should fetch image data and return formatted object", async () => {
    const fakeSearchResponse = [{ id: "cat-id", url: "https://example.com/cat.jpg" }];
    const fakeArrayBuffer = new Uint8Array([116, 101, 115, 116]).buffer; // "test" in base64

    const fakeImageResponse = {
      arrayBuffer: vi.fn().mockResolvedValue(fakeArrayBuffer),
    };

    (global.fetch as Mock)
      .mockResolvedValueOnce({ json: vi.fn().mockResolvedValue(fakeSearchResponse) })
      .mockResolvedValueOnce(fakeImageResponse);

    const result = await cloudImport();

    expect(global.fetch).toHaveBeenNthCalledWith(1, "https://api.thecatapi.com/v1/images/search");
    expect(global.fetch).toHaveBeenNthCalledWith(2, "https://example.com/cat.jpg");
    expect(result).toEqual({
      title: "cat-id",
      description: "Importiert von thecatapi.com",
      filename: path.basename("https://example.com/cat.jpg"),
      bytes: Buffer.from(fakeArrayBuffer).toString("base64"),
    });
  });
});
