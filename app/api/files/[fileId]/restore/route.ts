import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function POST(
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

    await prisma.file.update({
      where: {
        id: params.fileId,
      },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return new NextResponse("File restored successfully");
  } catch (error) {
    console.error("[FILE_RESTORE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 