import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

const updateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
});

export async function PATCH(
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

    const body = await req.json();
    const { name } = updateFolderSchema.parse(body);

    const updatedFolder = await prisma.folder.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Error updating folder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 