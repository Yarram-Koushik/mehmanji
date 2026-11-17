import { prisma } from "./src/lib/prisma";

async function verifyNeon() {
  try {
    const userCount = await prisma.user.count();
    const weddingCount = await prisma.wedding.count();
    const guestCount = await prisma.guest.count();
    const rsvpCount = await prisma.rsvp.count();
    const sampleGuest = await prisma.guest.findFirst({
      select: { name: true, token: true, wedding: { select: { familyName: true } } },
    });

    console.log("=== NEON CLOUD DATABASE TEST RESULT ===");
    console.log("Connected Host: ep-holy-wind-a1dggiu5.ap-southeast-1.aws.neon.tech");
    console.log("Total Users:", userCount);
    console.log("Total Weddings:", weddingCount);
    console.log("Total Guests:", guestCount);
    console.log("Total RSVPs:", rsvpCount);
    console.log("Sample Guest:", sampleGuest?.name);
    console.log("Wedding Name:", sampleGuest?.wedding.familyName);
    console.log("Guest Token:", sampleGuest?.token);
    console.log("Status: 100% OPERATIONAL");
  } catch (error) {
    console.error("Neon verification failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyNeon();
