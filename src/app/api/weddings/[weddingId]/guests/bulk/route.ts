import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bulkImportSchema } from "@/schemas/guest.schema";
import { nanoid } from "nanoid";

interface RouteParams {
  params: Promise<{ weddingId: string }>;
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
    const parsed = bulkImportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { guests } = parsed.data;
    const createdGuests = [];

    for (const g of guests) {
      const guest = await prisma.guest.create({
        data: {
          weddingId,
          groupId: g.groupId || null,
          name: g.name,
          phone: g.phone || "",
          email: g.email || "",
          token: nanoid(16),
        },
      });

      // Default pending RSVPs
      if (wedding.events.length > 0) {
        await prisma.rsvp.createMany({
          data: wedding.events.map((event) => ({
            guestId: guest.id,
            eventId: event.id,
            status: "PENDING",
          })),
        });
      }

      createdGuests.push(guest);
    }

    return NextResponse.json(
      { message: `Successfully imported ${createdGuests.length} guests`, count: createdGuests.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
