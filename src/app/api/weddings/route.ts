import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWeddingSchema } from "@/schemas/wedding.schema";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const weddings = await prisma.wedding.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        events: {
          orderBy: { sortOrder: "asc" },
        },
        _count: {
          select: {
            guests: { where: { isDeleted: false } },
            events: true,
          },
        },
      },
      orderBy: { weddingDate: "asc" },
    });

    return NextResponse.json(weddings);
  } catch (error) {
    console.error("Fetch weddings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createWeddingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { brideName, groomName, familyName, weddingDate, venue, city, themeColor } = parsed.data;

    const wedding = await prisma.wedding.create({
      data: {
        userId: session.user.id,
        brideName,
        groomName,
        familyName,
        weddingDate: new Date(weddingDate),
        venue,
        city,
        themeColor: themeColor || "#B91C6C",
        // Default default 4 sub-events for Indian weddings
        events: {
          create: [
            {
              name: "Mehendi & Haldi",
              type: "MEHENDI",
              eventDate: new Date(weddingDate),
              startTime: "3:00 PM",
              endTime: "7:00 PM",
              venue: venue,
              sortOrder: 1,
            },
            {
              name: "Sangeet Night",
              type: "SANGEET",
              eventDate: new Date(weddingDate),
              startTime: "7:30 PM",
              endTime: "11:30 PM",
              venue: venue,
              sortOrder: 2,
            },
            {
              name: "Wedding Ceremony (Pheras)",
              type: "WEDDING",
              eventDate: new Date(weddingDate),
              startTime: "6:00 PM",
              endTime: "10:00 PM",
              venue: venue,
              sortOrder: 3,
            },
            {
              name: "Reception",
              type: "RECEPTION",
              eventDate: new Date(weddingDate),
              startTime: "8:00 PM",
              endTime: "11:30 PM",
              venue: venue,
              sortOrder: 4,
            },
          ],
        },
        guestGroups: {
          create: [
            { name: "Family & Relatives", color: "#B91C6C" },
            { name: "Friends", color: "#D97706" },
            { name: "Colleagues", color: "#2563EB" },
          ],
        },
      },
      include: {
        events: true,
        guestGroups: true,
      },
    });

    return NextResponse.json(wedding, { status: 201 });
  } catch (error) {
    console.error("Create wedding error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
