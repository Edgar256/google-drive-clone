import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
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

    const trashedFiles = await prisma.file.findMany({
      where: {
        userId: user.id,
        isDeleted: true,
      },
    });

    return NextResponse.json(trashedFiles);
  } catch (error) {
    console.error("[TRASH_FILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE() {
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

    // Permanently delete all trashed files
    await prisma.file.deleteMany({
      where: {
        userId: user.id,
        isDeleted: true,
      },
    });

    return new NextResponse("Trash emptied successfully");
  } catch (error) {
    console.error("[TRASH_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 