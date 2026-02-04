import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/prisma/db";

const SALT_ROUNDS = 10;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role, location } = body as {
      email: string;
      password: string;
      name: string;
      role: "BUSINESS" | "EXPERT";
      location?: string;
    };
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Email, password, name, and role are required" },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        role,
        location: location ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        location: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (e) {
    const err = e as { code?: string };
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
