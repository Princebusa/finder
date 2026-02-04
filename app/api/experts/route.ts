import prisma from "@/prisma/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location")?.trim() || undefined;
  const expertise = searchParams.get("expertise")?.trim() || undefined;
  const minRating = searchParams.get("minRating");
  const minRatingNum = minRating ? parseFloat(minRating) : undefined;

  const experts = await prisma.user.findMany({
    where: {
      role: "EXPERT",
      ...(location && { location: { contains: location, mode: "insensitive" } }),
      expertProfile: {
        ...(minRatingNum != null && { rating: { gte: minRatingNum } }),
        ...(expertise && {
          expertises: {
            some: {
              name: { contains: expertise, mode: "insensitive" },
            },
          },
        }),
      },
    },
    select: {
      id: true,
      name: true,
      location: true,
      expertProfile: {
        select: {
          id: true,
          title: true,
          bio: true,
          hourlyRate: true,
          experience: true,
          rating: true,
          isAvailable: true,
          expertises: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  const list = experts
    .filter((u) => u.expertProfile != null)
    .map((u) => ({
      ...u,
      expertProfile: u.expertProfile!,
    }));

  return NextResponse.json(list);
}
