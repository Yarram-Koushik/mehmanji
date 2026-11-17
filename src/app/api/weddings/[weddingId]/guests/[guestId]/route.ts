import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateGuestSchema } from "@/schemas/guest.schema";

interface RouteParams {
  params: Promise<{ weddingId: string; guestId: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weddingId, guestId } = await params;
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = updateGuestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const guest = await prisma.guest.update({
      where: { id: guestId },
      data: parsed.data,
      include: {
        group: true,
        rsvps: true,
      },
    });

    return NextResponse.json(guest);
  } catch (error) {
    console.error("Update guest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weddingId, guestId } = await params;
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete
    await prisma.guest.update({
      where: { id: guestId },
      data: { isDeleted: true },
    });

    return NextResponse.json({ message: "Guest deleted successfully" });
  } catch (error) {
    console.error("Delete guest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
