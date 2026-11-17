import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createGuestSchema } from "@/schemas/guest.schema";
import { nanoid } from "nanoid";

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

    const url = new URL(request.url);
    const search = url.searchParams.get("search") || "";
    const groupId = url.searchParams.get("groupId");
    const status = url.searchParams.get("status");

    const guests = await prisma.guest.findMany({
      where: {
        weddingId,
        isDeleted: false,
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { phone: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
        ...(groupId ? { groupId } : {}),
      },
      include: {
        group: true,
        rsvps: {
          include: {
            event: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Optionally filter by RSVP status on any event if requested
    const filteredGuests = status
      ? guests.filter((g) => g.rsvps.some((r) => r.status === status))
      : guests;

    return NextResponse.json(filteredGuests);
  } catch (error) {
    console.error("Fetch guests error:", error);
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
      include: { events: true },
    });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createGuestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, phone, email, groupId, notes } = parsed.data;

    const guest = await prisma.guest.create({
      data: {
        weddingId,
        groupId: groupId || null,
        name,
        phone: phone || "",
        email: email || "",
        notes: notes || "",
        token: nanoid(16),
      },
      include: {
        group: true,
      },
    });

    // Automatically create default pending RSVP entries for each event in this wedding
    if (wedding.events.length > 0) {
      await prisma.rsvp.createMany({
        data: wedding.events.map((event) => ({
          guestId: guest.id,
          eventId: event.id,
          status: "PENDING",
        })),
      });
    }

    const fullGuest = await prisma.guest.findUnique({
      where: { id: guest.id },
      include: {
        group: true,
        rsvps: { include: { event: true } },
      },
    });

    return NextResponse.json(fullGuest, { status: 201 });
  } catch (error) {
    console.error("Create guest error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
