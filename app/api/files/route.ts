import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId");

    const files = await prisma.file.findMany({
      where: {
        userId: user.id,
        isDeleted: false,
        ...(folderId ? { folderId } : { folderId: null }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get("id");

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file || file.userId !== session.user.id) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    await prisma.file.delete({
      where: {
        id: fileId,
      },
    });

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 