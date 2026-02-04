import prisma from "@/prisma/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, role: "EXPERT" },
    select: {
      id: true,
      name: true,
      email: true,
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
          expertises: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Expert profile not found" }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, role: "EXPERT" },
    include: { expertProfile: { include: { expertises: true } } },
  });
  if (!user) {
    return NextResponse.json(
      { error: "Only experts can update expert profile" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const {
    title,
    bio,
    hourlyRate,
    experience,
    isAvailable,
    expertises,
  } = body as {
    title?: string;
    bio?: string;
    hourlyRate?: number | null;
    experience?: number;
    isAvailable?: boolean;
    expertises?: string[];
  };

  if (!title?.trim()) {
    return NextResponse.json(
      { error: "Title is required" },
      { status: 400 }
    );
  }

  if (user.expertProfile) {
    // Update existing profile
    if (expertises != null && Array.isArray(expertises)) {
      await prisma.expertise.deleteMany({
        where: { expertProfileId: user.expertProfile.id },
      });
      if (expertises.length > 0) {
        await prisma.expertise.createMany({
          data: expertises
            .filter((n): n is string => typeof n === "string" && n.trim() !== "")
            .map((name) => ({
              expertProfileId: user.expertProfile!.id,
              name: name.trim(),
            })),
        });
      }
    }
    const updated = await prisma.expertProfile.update({
      where: { id: user.expertProfile.id },
      data: {
        title: title.trim(),
        ...(bio !== undefined && { bio: bio?.trim() ?? null }),
        ...(hourlyRate !== undefined && { hourlyRate }),
        ...(experience !== undefined && { experience: Number(experience) }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
      },
      include: { expertises: { select: { id: true, name: true } } },
    });
    return NextResponse.json(updated);
  }

  // Create new expert profile
  const profile = await prisma.expertProfile.create({
    data: {
      userId,
      title: title.trim(),
      bio: bio?.trim() ?? null,
      hourlyRate: hourlyRate ?? null,
      experience: Number(experience) ?? 0,
      isAvailable: isAvailable ?? true,
      expertises:
        expertises && Array.isArray(expertises)
          ? {
              create: expertises
                .filter((n): n is string => typeof n === "string" && n.trim() !== "")
                .map((name) => ({ name: name.trim() })),
            }
          : undefined,
    },
    include: { expertises: { select: { id: true, name: true } } },
  });
  return NextResponse.json(profile);
}
