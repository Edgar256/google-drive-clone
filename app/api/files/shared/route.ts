import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface SharedFile {
  id: string;
  fileId: string;
  sharedWithId: string;
  file: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    createdAt: string;
  };
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const sharedFiles = await prisma.sharedFile.findMany({
      where: {
        sharedWithId: session.user.id,
      },
      include: {
        file: true,
      },
    });

    return NextResponse.json(sharedFiles);
  } catch (error) {
    console.error("[SHARED_FILES_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 