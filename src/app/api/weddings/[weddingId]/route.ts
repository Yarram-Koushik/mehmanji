import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateWeddingSchema } from "@/schemas/wedding.schema";
import { sortEventsChronologically } from "@/lib/utils";

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

    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: {
        events: {
          orderBy: [{ eventDate: "asc" }, { sortOrder: "asc" }],
        },
        guestGroups: true,
        guests: {
          where: { isDeleted: false },
          include: {
            rsvps: true,
            group: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Wedding not found or forbidden" }, { status: 404 });
    }

    // Calculate aggregated stats
    let totalConfirmed = 0;
    let totalDeclined = 0;
    let totalMaybe = 0;
    let totalPending = 0;
    let totalPartySize = 0;
    let vegCount = 0;
    let nonVegCount = 0;
    let jainCount = 0;
    let veganCount = 0;

    // Use main event (Wedding type or first event) for general headcount
    const primaryEvent = wedding.events.find((e) => e.type === "WEDDING") || wedding.events[0];

    if (primaryEvent) {
      wedding.guests.forEach((guest) => {
        const rsvp = guest.rsvps.find((r) => r.eventId === primaryEvent.id);
        if (!rsvp || rsvp.status === "PENDING") {
          totalPending++;
        } else if (rsvp.status === "CONFIRMED") {
          totalConfirmed++;
          totalPartySize += rsvp.partySize;
          vegCount += rsvp.vegCount;
          nonVegCount += rsvp.nonVegCount;
          jainCount += rsvp.jainCount;
          veganCount += rsvp.veganCount;
        } else if (rsvp.status === "DECLINED") {
          totalDeclined++;
        } else if (rsvp.status === "MAYBE") {
          totalMaybe++;
        }
      });
    }

    return NextResponse.json({
      ...wedding,
      events: sortEventsChronologically(wedding.events),
      stats: {
        totalGuests: wedding.guests.length,
        totalConfirmed,
        totalDeclined,
        totalMaybe,
        totalPending,
        totalPartySize,
        vegCount,
        nonVegCount,
        jainCount,
        veganCount,
      },
    });
  } catch (error) {
    console.error("Fetch wedding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { weddingId } = await params;
    const existing = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Wedding not found or forbidden" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = updateWeddingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.weddingDate) {
      data.weddingDate = new Date(parsed.data.weddingDate);
    }

    const updated = await prisma.wedding.update({
      where: { id: weddingId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update wedding error:", error);
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
    const existing = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Wedding not found or forbidden" }, { status: 404 });
    }

    await prisma.wedding.delete({ where: { id: weddingId } });

    return NextResponse.json({ message: "Wedding deleted successfully" });
  } catch (error) {
    console.error("Delete wedding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
