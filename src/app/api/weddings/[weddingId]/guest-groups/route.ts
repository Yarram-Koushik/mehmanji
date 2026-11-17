import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGuestGroupSchema } from "@/schemas/guest.schema";

interface RouteParams {
  params: Promise<{ weddingId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weddingId } = await params;
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const groups = await prisma.guestGroup.findMany({
      where: { weddingId },
      include: {
        _count: {
          select: { guests: { where: { isDeleted: false } } },
        },
      },
    });

    return NextResponse.json(groups);
  } catch (error) {
    console.error("Fetch groups error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weddingId } = await params;
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createGuestGroupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const group = await prisma.guestGroup.create({
      data: {
        weddingId,
        name: parsed.data.name,
        color: parsed.data.color || "#6B7280",
      },
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weddingId } = await params;
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const groupId = url.searchParams.get("groupId");

    if (!groupId) {
      return NextResponse.json({ error: "groupId parameter required" }, { status: 400 });
    }

    await prisma.guestGroup.delete({
      where: { id: groupId },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
