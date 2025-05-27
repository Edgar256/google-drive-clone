import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const folder = await prisma.folder.findUnique({
      where: { id: params.id }
    });

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json(
        { error: "Folder not found" },
        { status: 404 }
      );
    }

    // Fetch the folder path by recursively getting parent folders
    const path: { id: string; name: string }[] = [];
    let currentFolder = folder;

    while (currentFolder) {
      path.unshift({ id: currentFolder.id, name: currentFolder.name });
      
      if (!currentFolder.parentId) break;
      
      const parent = await prisma.folder.findUnique({
        where: { id: currentFolder.parentId }
      });

      if (!parent || parent.userId !== user.id) break;
      currentFolder = parent;
    }

    return NextResponse.json(path);
  } catch (error) {
    console.error("Error fetching folder path:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 