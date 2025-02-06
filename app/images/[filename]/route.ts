import { readFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { uploadFolder } from "@/access/cat";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> },
) {
    const filename = (await params).filename;
    const file = await readFile(path.join(uploadFolder, filename));

    return new NextResponse(file);
}
