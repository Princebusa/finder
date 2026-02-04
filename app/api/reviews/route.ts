import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { expertId, rating, comment } = body as {
    expertId: string;
    rating: number;
    comment?: string;
  };

  if (!expertId || rating == null || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Expert ID and rating (1–5) are required" },
      { status: 400 }
    );
  }

  const business = await prisma.user.findUnique({
    where: { id: userId, role: "BUSINESS" },
  });
  if (!business) {
    return NextResponse.json(
      { error: "Only business accounts can leave reviews" },
      { status: 403 }
    );
  }

  const expert = await prisma.user.findUnique({
    where: { id: expertId, role: "EXPERT" },
  });
  if (!expert) {
    return NextResponse.json({ error: "Expert not found" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      businessId: userId,
      expertId,
      rating,
      comment: comment?.trim() ?? null,
    },
  });

  // Update expert profile average rating
  const reviews = await prisma.review.findMany({
    where: { expertId },
    select: { rating: true },
  });
  const avg =
    reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const profile = await prisma.expertProfile.findUnique({
    where: { userId: expertId },
  });
  if (profile) {
    await prisma.expertProfile.update({
      where: { id: profile.id },
      data: { rating: Math.round(avg * 10) / 10 },
    });
  }

  return NextResponse.json(review);
}
