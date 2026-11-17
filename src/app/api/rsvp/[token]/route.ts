import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { submitRsvpSchema } from "@/schemas/rsvp.schema";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`rsvp_get:${ip}`, 30, 60000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 });
    }

    const { token } = await params;

    const guest = await prisma.guest.findUnique({
      where: { token },
      include: {
        wedding: {
          select: {
            id: true,
            brideName: true,
            groomName: true,
            familyName: true,
            weddingDate: true,
            venue: true,
            city: true,
            themeColor: true,
            coverImageUrl: true,
            events: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        group: true,
        rsvps: true,
      },
    });

    if (!guest || guest.isDeleted) {
      return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
    }

    return NextResponse.json({
      guest: {
        id: guest.id,
        name: guest.name,
        phone: guest.phone,
        email: guest.email,
        token: guest.token,
      },
      wedding: guest.wedding,
      events: guest.wedding.events,
      existingRsvps: guest.rsvps,
    });
  } catch (error) {
    console.error("Fetch RSVP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`rsvp_post:${ip}`, 20, 60000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many submissions. Please wait." }, { status: 429 });
    }

    const { token } = await params;

    const guest = await prisma.guest.findUnique({
      where: { token },
      include: { wedding: { include: { events: true } } },
    });

    if (!guest || guest.isDeleted) {
      return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = submitRsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const validEventIds = new Set(guest.wedding.events.map((e) => e.id));

    // Upsert RSVP records for each event
    const results = [];
    for (const item of parsed.data.rsvps) {
      if (!validEventIds.has(item.eventId)) {
        continue;
      }

      const rsvp = await prisma.rsvp.upsert({
        where: {
          guestId_eventId: {
            guestId: guest.id,
            eventId: item.eventId,
          },
        },
        create: {
          guestId: guest.id,
          eventId: item.eventId,
          status: item.status,
          partySize: item.status === "CONFIRMED" ? item.partySize : 1,
          vegCount: item.status === "CONFIRMED" ? item.vegCount : 0,
          nonVegCount: item.status === "CONFIRMED" ? item.nonVegCount : 0,
          jainCount: item.status === "CONFIRMED" ? item.jainCount : 0,
          veganCount: item.status === "CONFIRMED" ? item.veganCount : 0,
          arrivalTime: item.arrivalTime,
          dietaryNotes: item.dietaryNotes,
          respondedAt: new Date(),
        },
        update: {
          status: item.status,
          partySize: item.status === "CONFIRMED" ? item.partySize : 1,
          vegCount: item.status === "CONFIRMED" ? item.vegCount : 0,
          nonVegCount: item.status === "CONFIRMED" ? item.nonVegCount : 0,
          jainCount: item.status === "CONFIRMED" ? item.jainCount : 0,
          veganCount: item.status === "CONFIRMED" ? item.veganCount : 0,
          arrivalTime: item.arrivalTime,
          dietaryNotes: item.dietaryNotes,
          respondedAt: new Date(),
        },
      });

      results.push(rsvp);
    }

    return NextResponse.json({
      message: "RSVP updated successfully! Thank you.",
      rsvps: results,
    });
  } catch (error) {
    console.error("Submit RSVP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
