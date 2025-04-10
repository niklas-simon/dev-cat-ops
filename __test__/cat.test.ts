// @vitest-environment node

import path from "path";
import { mkdir, stat, writeFile, rm } from "fs/promises";
import { createHash } from "crypto";

import { PrismaClient } from "@prisma/client";
import { describe, it, expect, beforeEach, vi, Mock } from "vitest";

import * as catService from "../access/cat";

// --- Mocks Setup ---

// Mock fs/promises methods
vi.mock("fs/promises", async () => {
    const actual = await vi.importActual("fs/promises");

    return {
        ...actual,
        stat: vi.fn(),
        mkdir: vi.fn(),
        writeFile: vi.fn(),
        rm: vi.fn(),
    };
});

// Mock the Prisma client
vi.mock("@prisma/client", () => {
    const mPrismaClient = {
        cat: {
            create: vi.fn(),
            findFirst: vi.fn(),
            update: vi.fn(),
            findMany: vi.fn(),
            delete: vi.fn(),
        },
    };

    return {
        PrismaClient: vi.fn(() => mPrismaClient),
    };
});

// Mock randomUUID to return always the same UUID
const TEST_UUID: string = "550e8400-e29b-41d4-a716-446655440000";

vi.mock("crypto", async () => {
    const actual = await vi.importActual("crypto");

    return {
        ...actual,
        randomUUID: () => TEST_UUID,
    };
});

// --- Tests ---

describe("Cat Access", () => {
    let prismaClientMock: any;
    const uploadFolder = catService.uploadFolder;

    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        prismaClientMock = new PrismaClient();
    });

    describe("create", () => {
        it("create a new cat and write the image file to the upload folder", async () => {
            const newCat = {
                title: "Test Cat",
                description: "A lovely test cat",
                rating: 5,
                filename: "cat.jpg",
                // Create a base64 string for sample bytes.
                bytes: Buffer.from("image data").toString("base64"),
            };

            // Simulate that the upload folder exists.
            (stat as unknown as Mock).mockResolvedValue({
                isDirectory: () => true,
            });
            // Simulate Prisma create returning a record with the given id.
            prismaClientMock.cat.create.mockResolvedValue({ id: TEST_UUID });

            // Act
            const id = await catService.create(newCat);

            // Check
            expect(typeof id).toBe("string");
            expect(prismaClientMock.cat.create).toHaveBeenCalled();
            expect(writeFile).toHaveBeenCalledWith(
                path.join(uploadFolder, TEST_UUID + "_cat.jpg"),
                expect.any(Uint8Array),
            );
        });

        it("create the upload folder if it does not exist", async () => {
            const newCat = {
                title: "Test Cat",
                description: "A lovely test cat",
                rating: 5,
                filename: "cat.jpg",
                bytes: Buffer.from("image data").toString("base64"),
            };

            // Simulate stat throwing an error so that mkdir is called.
            (stat as unknown as Mock).mockRejectedValue(new Error("Not found"));
            prismaClientMock.cat.create.mockResolvedValue({ id: TEST_UUID });

            // Act
            const id = await catService.create(newCat);

            // Check
            expect(mkdir).toHaveBeenCalledWith(uploadFolder, {
                recursive: true,
            });
            expect(id).toBe(TEST_UUID);
        });
    });

    describe("get", () => {
        it("return a cat when found", async () => {
            const cat = {
                id: TEST_UUID,
                title: "Test Cat",
                description: "A lovely test cat",
                rating: 5,
                filename: TEST_UUID + "_cat.jpg",
                hash: "hashvalue",
            };

            // Simulate that the cat is found in the database
            prismaClientMock.cat.findFirst.mockResolvedValue(cat);

            // Act
            const result = await catService.get(TEST_UUID);

            // Check
            expect(result).toEqual(cat);
        });

        it("return null if the cat is not found", async () => {
            // Simulate that the cat is not found in the database
            prismaClientMock.cat.findFirst.mockResolvedValue(null);

            // Act
            const result = await catService.get("non-existent-id");

            // Check
            expect(result).toBeNull();
        });
    });

    describe("update", () => {
        it("update cat metadata without changing the file if bytes are not provided", async () => {
            const existingCat = {
                id: TEST_UUID,
                title: "Old Title",
                description: "Old description",
                rating: 4,
                filename: TEST_UUID + "_cat.jpg",
                hash: "oldhash",
            };

            // Simultae the database to return the existing cat.
            prismaClientMock.cat.findFirst.mockResolvedValue(existingCat);

            const updatedCat = {
                ...existingCat,
                title: "New Title",
                description: "New description",
                rating: 5,
                // No bytes provided in this update.
                bytes: undefined,
                filename: "cat.jpg",
            };

            // Act
            await catService.update(updatedCat);

            // Check
            expect(prismaClientMock.cat.update).toHaveBeenCalledWith({
                where: { id: TEST_UUID },
                data: {
                    title: "New Title",
                    description: "New description",
                    rating: 5,
                    filename: existingCat.filename,
                    hash: existingCat.hash,
                },
            });
            expect(rm).not.toHaveBeenCalled();
            expect(writeFile).not.toHaveBeenCalled();
        });

        it("update a cat and replace the file if new bytes are provided and the hash differs", async () => {
            const existingCat = {
                id: TEST_UUID,
                title: "Old Title",
                description: "Old description",
                rating: 4,
                filename: TEST_UUID + "_cat.jpg",
                hash: "oldhash",
            };

            // Simulate the database to return the existing cat
            prismaClientMock.cat.findFirst.mockResolvedValue(existingCat);

            // Create a new base64 string for new image data
            const newBytes = Buffer.from("new image data").toString("base64");
            // Compute the expected new hash
            const expectedHash = createHash("sha256")
                .update(new Uint8Array(Buffer.from(newBytes, "base64")))
                .end()
                .setEncoding("base64")
                .read();

            const updatedCat = {
                ...existingCat,
                title: "Updated Title",
                description: "Updated description",
                rating: 5,
                bytes: newBytes,
                filename: "newcat.jpg",
            };

            // Act
            await catService.update(updatedCat);

            // Check
            // Expect the old file to be removed.
            expect(rm).toHaveBeenCalledWith(
                path.join(uploadFolder, existingCat.filename),
            );
            // Expect a new file to be written (with the new filename format).
            expect(writeFile).toHaveBeenCalledWith(
                path.join(uploadFolder, TEST_UUID + "_newcat.jpg"),
                expect.any(Uint8Array),
            );
            // Ensure the Prisma update was called with the new hash and new filename.
            expect(prismaClientMock.cat.update).toHaveBeenCalledWith({
                where: { id: TEST_UUID },
                data: {
                    title: "Updated Title",
                    description: "Updated description",
                    rating: 5,
                    filename: TEST_UUID + "_newcat.jpg",
                    hash: expectedHash,
                },
            });
        });

        it("update nothing if the cat does not exist", async () => {
            // Simulate that the cat is not found in the database
            prismaClientMock.cat.findFirst.mockResolvedValue(null);

            const updatedCat = {
                id: "non-existent",
                title: "Title",
                description: "Desc",
                rating: 3,
                bytes: undefined,
                filename: "cat.jpg",
                hash: "somehash",
            };

            // Act
            await catService.update(updatedCat);

            // Check
            expect(prismaClientMock.cat.update).not.toHaveBeenCalled();
            expect(rm).not.toHaveBeenCalled();
            expect(writeFile).not.toHaveBeenCalled();
        });
    });

    describe("getList", () => {
        it("call findMany with correct filters and sorting", async () => {
            const filter = {
                search: "Test",
                rating: [2, 5],
                sort: "alpha_asc",
            };

            const expectedWhere = {
                AND: [
                    {
                        OR: [
                            { title: { contains: "Test" } },
                            { description: { contains: "Test" } },
                        ],
                    },
                    { rating: { gte: 2 } },
                    { rating: { lte: 5 } },
                ],
            };

            // Mock database
            prismaClientMock.cat.findMany.mockResolvedValue([]);

            // Act
            await catService.getList(filter);

            // Chack
            expect(prismaClientMock.cat.findMany).toHaveBeenCalledWith({
                where: expectedWhere,
                orderBy: { title: "asc" },
            });
        });
    });

    describe("remove", () => {
        it("delete a cat by id", async () => {
            const cat = {
                id: TEST_UUID,
                title: "Test Cat",
                description: "A lovely test cat",
                rating: 5,
                filename: TEST_UUID + "_cat.jpg",
                hash: "hashvalue",
            };

            // Simulate that the cat is found in the database
            prismaClientMock.cat.findFirst.mockResolvedValue(cat);

            // Act
            await catService.remove(TEST_UUID);

            // Test
            expect(prismaClientMock.cat.delete).toHaveBeenCalledWith({
                where: { id: TEST_UUID },
            });
            expect(rm).toHaveBeenCalledWith(
                path.join(uploadFolder, TEST_UUID + "_cat.jpg"),
            );
        });

        it("delete a cat by id that is not found in the database", async () => {
            // Simulate that the cat is not found in the database
            prismaClientMock.cat.findFirst.mockResolvedValue(null);

            // Act
            await catService.remove(TEST_UUID);

            // Test
            expect(prismaClientMock.cat.delete).not.toHaveBeenCalled();
            expect(rm).not.toHaveBeenCalled();
        });
    });
});
