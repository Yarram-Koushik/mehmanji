import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
        events: { orderBy: [{ eventDate: "asc" }, { sortOrder: "asc" }] },
        guests: {
          where: { isDeleted: false },
          include: {
            group: true,
            rsvps: true,
          },
        },
      },
    });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const url = new URL(request.url);
    const selectedEventId = url.searchParams.get("eventId");

    const sortedEvents = sortEventsChronologically(wedding.events);
    const eventsToReport = selectedEventId
      ? sortedEvents.filter((e) => e.id === selectedEventId)
      : sortedEvents;

    const reports = eventsToReport.map((event) => {
      let totalConfirmed = 0;
      let totalDeclined = 0;
      let totalMaybe = 0;
      let totalPending = 0;
      let totalPartySize = 0;
      let vegCount = 0;
      let nonVegCount = 0;
      let jainCount = 0;
      let veganCount = 0;

      const guestBreakdown: Array<{
        guestId: string;
        guestName: string;
        groupName: string;
        phone: string;
        status: string;
        partySize: number;
        vegCount: number;
        nonVegCount: number;
        jainCount: number;
        veganCount: number;
        arrivalTime: string;
        dietaryNotes: string;
      }> = [];

      wedding.guests.forEach((guest) => {
        const rsvp = guest.rsvps.find((r) => r.eventId === event.id);
        const status = rsvp?.status || "PENDING";

        if (status === "CONFIRMED") {
          totalConfirmed++;
          const pSize = rsvp?.partySize || 1;
          totalPartySize += pSize;
          vegCount += rsvp?.vegCount || 0;
          nonVegCount += rsvp?.nonVegCount || 0;
          jainCount += rsvp?.jainCount || 0;
          veganCount += rsvp?.veganCount || 0;
        } else if (status === "DECLINED") {
          totalDeclined++;
        } else if (status === "MAYBE") {
          totalMaybe++;
        } else {
          totalPending++;
        }

        guestBreakdown.push({
          guestId: guest.id,
          guestName: guest.name,
          groupName: guest.group?.name || "Ungrouped",
          phone: guest.phone,
          status,
          partySize: status === "CONFIRMED" ? rsvp?.partySize || 1 : 0,
          vegCount: status === "CONFIRMED" ? rsvp?.vegCount || 0 : 0,
          nonVegCount: status === "CONFIRMED" ? rsvp?.nonVegCount || 0 : 0,
          jainCount: status === "CONFIRMED" ? rsvp?.jainCount || 0 : 0,
          veganCount: status === "CONFIRMED" ? rsvp?.veganCount || 0 : 0,
          arrivalTime: rsvp?.arrivalTime || "ON_TIME",
          dietaryNotes: rsvp?.dietaryNotes || "",
        });
      });

      // Recommended buffer (10% standard catering buffer for unannounced additions)
      const bufferRecommendation = Math.ceil(totalPartySize * 0.1);
      const totalPlatesWithBuffer = totalPartySize + bufferRecommendation;

      return {
        eventId: event.id,
        eventName: event.name,
        eventType: event.type,
        eventDate: event.eventDate,
        startTime: event.startTime,
        venue: event.venue,
        stats: {
          totalGuestsInvited: wedding.guests.length,
          totalConfirmed,
          totalDeclined,
          totalMaybe,
          totalPending,
          totalPartySize,
          bufferRecommendation,
          totalPlatesWithBuffer,
          vegCount,
          nonVegCount,
          jainCount,
          veganCount,
        },
        guestBreakdown,
      };
    });

    return NextResponse.json({
      wedding: {
        id: wedding.id,
        familyName: wedding.familyName,
        brideName: wedding.brideName,
        groomName: wedding.groomName,
        weddingDate: wedding.weddingDate,
      },
      reports,
    });
  } catch (error) {
    console.error("Generate report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
