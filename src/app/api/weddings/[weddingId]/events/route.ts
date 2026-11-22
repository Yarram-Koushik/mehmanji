import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createEventSchema } from "@/schemas/event.schema";
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
    const wedding = await prisma.wedding.findUnique({ where: { id: weddingId } });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Wedding not found or forbidden" }, { status: 404 });
    }

    const events = await prisma.event.findMany({
      where: { weddingId },
      include: {
        rsvps: true,
      },
      orderBy: [{ eventDate: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json(sortEventsChronologically(events));
  } catch (error) {
    console.error("Fetch events error:", error);
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
    const wedding = await prisma.wedding.findUnique({
      where: { id: weddingId },
      include: { guests: { where: { isDeleted: false } } },
    });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Wedding not found or forbidden" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, type, eventDate, startTime, endTime, venue, address, sortOrder } = parsed.data;

    const event = await prisma.event.create({
      data: {
        weddingId,
        name,
        type,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        venue,
        address,
        sortOrder,
      },
    });

    // Automatically create a pending RSVP entry for all existing guests of this wedding
    if (wedding.guests.length > 0) {
      await prisma.rsvp.createMany({
        data: wedding.guests.map((g) => ({
          guestId: g.id,
          eventId: event.id,
          status: "PENDING",
        })),
      });
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
