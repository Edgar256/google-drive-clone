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

    const starredFiles = await prisma.file.findMany({
      where: {
        userId: user.id,
        isStarred: true,
        isDeleted: false,
      },
    });

    return NextResponse.json(starredFiles);
  } catch (error) {
    console.error("[STARRED_FILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 