import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { z } from "zod";

const updateFileSchema = z.object({
  name: z.string().min(1, "File name is required"),
});

export async function PATCH(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const file = await prisma.file.findUnique({
      where: {
        id: params.fileId,
        userId: user.id,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    const body = await req.json();
    const { name } = updateFileSchema.parse(body);

    const updatedFile = await prisma.file.update({
      where: {
        id: params.fileId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(updatedFile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("[FILE_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const file = await prisma.file.findUnique({
      where: {
        id: params.fileId,
        userId: user.id,
      },
    });

    if (!file) {
      return new NextResponse("File not found", { status: 404 });
    }

    // If the file is already in trash, delete it permanently
    if (file.isDeleted) {
      await prisma.file.delete({
        where: {
          id: params.fileId,
        },
      });
    } else {
      // Otherwise, move it to trash
      await prisma.file.update({
        where: {
          id: params.fileId,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    return new NextResponse("File deleted successfully");
  } catch (error) {
    console.error("[FILE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 