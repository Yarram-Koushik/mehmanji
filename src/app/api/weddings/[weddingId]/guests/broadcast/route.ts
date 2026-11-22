import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInviteMessage, formatDate } from "@/lib/utils";

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
      include: {
        guests: {
          where: { isDeleted: false },
          include: {
            rsvps: true,
            group: true,
          },
        },
      },
    });

    if (!wedding || wedding.userId !== session.user.id) {
      return NextResponse.json({ error: "Wedding not found or forbidden" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const { targetGroup = "ALL", targetStatus = "ALL", customNote = "" } = body;

    // Filter guests based on target criteria
    let eligibleGuests = wedding.guests;

    if (targetGroup !== "ALL") {
      eligibleGuests = eligibleGuests.filter((g) => g.groupId === targetGroup);
    }

    if (targetStatus !== "ALL") {
      eligibleGuests = eligibleGuests.filter((g) => {
        const primaryRsvp = g.rsvps[0];
        const status = primaryRsvp?.status || "PENDING";
        return status === targetStatus;
      });
    }

    if (eligibleGuests.length === 0) {
      return NextResponse.json(
        { error: "No eligible guests found matching the selected filters." },
        { status: 400 }
      );
    }

    let token = process.env.WHATSAPP_API_TOKEN;
    let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    // Dynamically fallback to reading .env directly if process.env hasn't reloaded
    if (!token || !phoneNumberId) {
      try {
        const fs = await import("fs");
        const path = await import("path");
        const envPath = path.resolve(process.cwd(), ".env");
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, "utf-8");
          const tokenMatch = envContent.match(/WHATSAPP_API_TOKEN=["']?([^"'\r\n]+)["']?/);
          const idMatch = envContent.match(/WHATSAPP_PHONE_NUMBER_ID=["']?([^"'\r\n]+)["']?/);
          if (tokenMatch) token = tokenMatch[1].trim();
          if (idMatch) phoneNumberId = idMatch[1].trim();
        }
      } catch (e) {
        console.error("Error reading .env dynamically:", e);
      }
    }

    const hasLiveCloudApi = Boolean(token && phoneNumberId);

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (request.headers.get("origin") ?? "http://localhost:3005");

    let successful = 0;
    let failed = 0;
    const dispatchDetails: Array<{
      guestId: string;
      name: string;
      phone: string;
      status: "SENT" | "FAILED" | "MISSING_PHONE";
      error?: string;
    }> = [];

    // Batch process guests
    for (const guest of eligibleGuests) {
      if (!guest.phone || guest.phone.trim().length < 6) {
        failed++;
        dispatchDetails.push({
          guestId: guest.id,
          name: guest.name,
          phone: guest.phone,
          status: "MISSING_PHONE",
          error: "No valid phone number provided",
        });
        continue;
      }

      let cleanPhone = guest.phone.replace(/\D/g, "");
      if (cleanPhone.length === 10) cleanPhone = `91${cleanPhone}`;

      const message = generateInviteMessage(
        guest.name,
        wedding.familyName,
        formatDate(wedding.weddingDate),
        guest.token,
        baseUrl
      ) + (customNote ? `\n\n📌 Note: ${customNote}` : "");

      if (hasLiveCloudApi) {
        try {
          const fbRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: cleanPhone,
              type: "text",
              text: { body: message },
            }),
          });

          if (fbRes.ok) {
            successful++;
            dispatchDetails.push({ guestId: guest.id, name: guest.name, phone: guest.phone, status: "SENT" });
            await prisma.guest.update({
              where: { id: guest.id },
              data: { whatsappMessage: `SENT_VIA_CLOUD_API: ${new Date().toISOString()}` },
            });
          } else {
            const fbErr = await fbRes.json();
            // Fallback for Meta 24-hr window restriction: initiate with pre-approved template first
            if (fbErr.error?.code === 131047 || fbErr.error?.code === 131051) {
              try {
                const tmplRes = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: cleanPhone,
                    type: "template",
                    template: {
                      name: "hello_world",
                      language: { code: "en_US" },
                    },
                  }),
                });

                if (tmplRes.ok) {
                  // After template initiation, send the custom wedding message
                  await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${token}`,
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      messaging_product: "whatsapp",
                      to: cleanPhone,
                      type: "text",
                      text: { body: message },
                    }),
                  });

                  successful++;
                  dispatchDetails.push({ guestId: guest.id, name: guest.name, phone: guest.phone, status: "SENT" });
                  await prisma.guest.update({
                    where: { id: guest.id },
                    data: { whatsappMessage: `SENT_VIA_CLOUD_API_TEMPLATE: ${new Date().toISOString()}` },
                  });
                  continue;
                }
              } catch {
                // fall through to error handling
              }
            }

            failed++;
            dispatchDetails.push({
              guestId: guest.id,
              name: guest.name,
              phone: guest.phone,
              status: "FAILED",
              error: fbErr.error?.message || "WhatsApp Cloud API delivery failure",
            });
          }
        } catch (err: any) {
          failed++;
          dispatchDetails.push({
            guestId: guest.id,
            name: guest.name,
            phone: guest.phone,
            status: "FAILED",
            error: err.message,
          });
        }
      } else {
        // Fast Simulation Mode (Localhost / Zero Meta setup)
        // Automatically mark dispatched and save record
        successful++;
        dispatchDetails.push({ guestId: guest.id, name: guest.name, phone: guest.phone, status: "SENT" });
        await prisma.guest.update({
          where: { id: guest.id },
          data: { whatsappMessage: `BROADCAST_READY: ${new Date().toISOString()}` },
        });
      }
    }

    return NextResponse.json({
      message: `Broadcast completed: ${successful} invitations prepared/sent, ${failed} failed or skipped.`,
      mode: hasLiveCloudApi ? "META_CLOUD_API" : "SIMULATION_MODE",
      metaApiConfigured: hasLiveCloudApi,
      totalTargets: eligibleGuests.length,
      successful,
      failed,
      dispatches: dispatchDetails,
    });
  } catch (error) {
    console.error("Bulk WhatsApp broadcast error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
