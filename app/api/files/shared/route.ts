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

    const sharedFiles = await prisma.sharedFile.findMany({
      where: {
        sharedWithId: user.id,
      },
      include: {
        file: true,
        sharedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const formattedFiles = sharedFiles.map((sharedFile) => ({
      id: sharedFile.file.id,
      name: sharedFile.file.name,
      url: sharedFile.file.url,
      type: sharedFile.file.type,
      size: sharedFile.file.size,
      createdAt: sharedFile.file.createdAt,
      sharedBy: sharedFile.sharedBy,
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error("[SHARED_FILES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 