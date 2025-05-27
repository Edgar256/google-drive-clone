import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateFileSchema = z.object({
  folderId: z.string().nullable(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { fileId: string } }
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

    const file = await prisma.file.findUnique({
      where: { id: params.fileId }
    });

    if (!file || file.userId !== user.id) {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { folderId } = updateFileSchema.parse(body);

    // If moving to a folder, verify the folder exists and belongs to the user
    if (folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: folderId }
      });

      if (!folder || folder.userId !== user.id) {
        return NextResponse.json(
          { error: "Folder not found" },
          { status: 404 }
        );
      }
    }

    const updatedFile = await prisma.file.update({
      where: { id: params.fileId },
      data: { folderId },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 