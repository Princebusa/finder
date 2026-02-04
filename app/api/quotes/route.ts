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
  const { expertId, description, budget } = body as {
    expertId: string;
    description: string;
    budget?: number;
  };

  if (!expertId || !description?.trim()) {
    return NextResponse.json(
      { error: "Expert ID and description are required" },
      { status: 400 }
    );
  }

  const business = await prisma.user.findUnique({
    where: { id: userId, role: "BUSINESS" },
  });
  if (!business) {
    return NextResponse.json(
      { error: "Only business accounts can request quotes" },
      { status: 403 }
    );
  }

  const expert = await prisma.user.findUnique({
    where: { id: expertId, role: "EXPERT" },
  });
  if (!expert) {
    return NextResponse.json({ error: "Expert not found" }, { status: 404 });
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      businessId: userId,
      expertId,
      description: description.trim(),
      budget: budget ?? null,
    },
  });

  return NextResponse.json(quote);
}
