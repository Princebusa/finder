import prisma from "@/prisma/db";
import { useSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { data: session } = useSession();

  const user = session?.user?.email;
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.findUnique({
    where: {
      email: user,
      role: 'EXPERT',
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      expertProfile: {
        select: {
          id: true,
          title: true,
          bio: true,
          hourlyRate: true,
          experience: true,
          rating: true,
          isAvailable: true,
          expertises: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ message: "User found" }, { status: 200 });
}
