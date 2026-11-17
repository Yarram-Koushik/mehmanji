import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting MehmanJi database seeding...");

  // Clean existing data
  await prisma.rsvp.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.guestGroup.deleteMany();
  await prisma.event.deleteMany();
  await prisma.wedding.deleteMany();
  await prisma.user.deleteMany();

  // Create test user (Organizer)
  const passwordHash = await hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Priya Sharma",
      email: "priya@example.com",
      passwordHash,
      phone: "+91 98765 43210",
    },
  });
  console.log(`👤 Created user: ${user.name} (${user.email})`);

  // Create wedding
  const weddingDate = new Date("2026-12-20T18:00:00.000Z");
  const wedding = await prisma.wedding.create({
    data: {
      userId: user.id,
      brideName: "Priya Sharma",
      groomName: "Rohan Patel",
      familyName: "The Sharma-Patel Wedding",
      weddingDate,
      venue: "The Grand Palace Banquet & Lawns",
      city: "Jaipur, Rajasthan",
      coverImageUrl: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80",
      themeColor: "#B91C6C",
    },
  });
  console.log(`💒 Created wedding: ${wedding.familyName}`);

  // Create Events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        weddingId: wedding.id,
        name: "Mehendi & Haldi Fiesta",
        type: "MEHENDI",
        eventDate: new Date("2026-12-18T15:00:00.000Z"),
        startTime: "3:00 PM",
        endTime: "7:00 PM",
        venue: "Poolside Lawns",
        address: "The Grand Palace, Tonk Road, Jaipur",
        sortOrder: 1,
      },
    }),
    prisma.event.create({
      data: {
        weddingId: wedding.id,
        name: "Sangeet Night: Nachle Ve",
        type: "SANGEET",
        eventDate: new Date("2026-12-19T19:00:00.000Z"),
        startTime: "7:00 PM",
        endTime: "11:30 PM",
        venue: "Royal Crystal Ballroom",
        address: "The Grand Palace, Tonk Road, Jaipur",
        sortOrder: 2,
      },
    }),
    prisma.event.create({
      data: {
        weddingId: wedding.id,
        name: "Pheras & Wedding Ceremony",
        type: "WEDDING",
        eventDate: new Date("2026-12-20T18:00:00.000Z"),
        startTime: "6:00 PM",
        endTime: "10:00 PM",
        venue: "Mandapam Central Courtyard",
        address: "The Grand Palace, Tonk Road, Jaipur",
        sortOrder: 3,
      },
    }),
    prisma.event.create({
      data: {
        weddingId: wedding.id,
        name: "Grand Gala Reception",
        type: "RECEPTION",
        eventDate: new Date("2026-12-21T20:00:00.000Z"),
        startTime: "8:00 PM",
        endTime: "12:00 AM",
        venue: "Maharaja Heritage Gardens",
        address: "The Grand Palace, Tonk Road, Jaipur",
        sortOrder: 4,
      },
    }),
  ]);
  console.log(`📅 Created ${events.length} sub-events`);

  // Create Guest Groups
  const groupFamily = await prisma.guestGroup.create({
    data: { weddingId: wedding.id, name: "Family & Relatives", color: "#B91C6C" },
  });
  const groupFriends = await prisma.guestGroup.create({
    data: { weddingId: wedding.id, name: "College & School Friends", color: "#D97706" },
  });
  const groupColleagues = await prisma.guestGroup.create({
    data: { weddingId: wedding.id, name: "Office Colleagues", color: "#2563EB" },
  });
  const groupNeighbors = await prisma.guestGroup.create({
    data: { weddingId: wedding.id, name: "Society & Neighbors", color: "#16A34A" },
  });

  // Create realistic guests
  const guestData = [
    { name: "Sunil Sharma (Chacha Ji)", phone: "+919811122233", email: "sunil.chacha@gmail.com", group: groupFamily, status: "CONFIRMED", partySize: 4, veg: 3, nonVeg: 0, jain: 1, vegan: 0, arrival: "ON_TIME", notes: "No onions for Chachi ji" },
    { name: "Kavita Verma (Bua Ji)", phone: "+919822233344", email: "kavita.bua@gmail.com", group: groupFamily, status: "CONFIRMED", partySize: 3, veg: 3, nonVeg: 0, jain: 0, vegan: 0, arrival: "BEFORE_EVENT", notes: "Will arrive early for Mehendi setup" },
    { name: "Ramesh Uncle (Sharma Niwas)", phone: "+919833344455", email: "ramesh.sharma@yahoo.co.in", group: groupFamily, status: "CONFIRMED", partySize: 5, veg: 3, nonVeg: 2, jain: 0, vegan: 0, arrival: "ON_TIME", notes: "Kids love paneer tikka" },
    { name: "Ananya Gupta (Best Friend)", phone: "+919844455566", email: "ananya.g@outlook.com", group: groupFriends, status: "CONFIRMED", partySize: 2, veg: 1, nonVeg: 1, jain: 0, vegan: 0, arrival: "ON_TIME", notes: "Preparing bridesmaid dance!" },
    { name: "Vikram Malhotra", phone: "+919855566677", email: "vikram.m@techcorp.in", group: groupFriends, status: "CONFIRMED", partySize: 2, veg: 0, nonVeg: 2, jain: 0, vegan: 0, arrival: "SLIGHTLY_LATE", notes: "Flight lands at 5 PM on Sangeet day" },
    { name: "Kabir Singh & Sneha", phone: "+919866677788", email: "kabir.singh@gmail.com", group: groupFriends, status: "DECLINED", partySize: 1, veg: 0, nonVeg: 0, jain: 0, vegan: 0, arrival: "LATE", notes: "Unavoidable work trip to Dubai" },
    { name: "Dr. Arvind Mehta", phone: "+919877788899", email: "mehta.clinic@gmail.com", group: groupNeighbors, status: "CONFIRMED", partySize: 2, veg: 0, nonVeg: 0, jain: 2, vegan: 0, arrival: "ON_TIME", notes: "Strict Jain food required" },
    { name: "Rajesh Singhania (VP Tech)", phone: "+919888899900", email: "rajesh@innovate.co", group: groupColleagues, status: "CONFIRMED", partySize: 2, veg: 1, nonVeg: 1, jain: 0, vegan: 0, arrival: "ON_TIME", notes: "" },
    { name: "Neha Joshi", phone: "+919899900011", email: "neha.joshi@gmail.com", group: groupColleagues, status: "MAYBE", partySize: 1, veg: 1, nonVeg: 0, jain: 0, vegan: 0, arrival: "SLIGHTLY_LATE", notes: "Awaiting leave approval from manager" },
    { name: "Deepak Choudhary", phone: "+919800011122", email: "deepak.c@finance.in", group: groupColleagues, status: "PENDING", partySize: 1, veg: 0, nonVeg: 0, jain: 0, vegan: 0, arrival: "ON_TIME", notes: "" },
    { name: "Amitabh Bansal", phone: "+919812345678", email: "bansal.amit@gmail.com", group: groupNeighbors, status: "CONFIRMED", partySize: 3, veg: 3, nonVeg: 0, jain: 0, vegan: 0, arrival: "ON_TIME", notes: "" },
    { name: "Suresh Agarwal (Mamu)", phone: "+919823456789", email: "suresh.agarwal@gmail.com", group: groupFamily, status: "CONFIRMED", partySize: 4, veg: 0, nonVeg: 0, jain: 4, vegan: 0, arrival: "BEFORE_EVENT", notes: "Pure Jain preparations only" },
    { name: "Tanya Kapoor", phone: "+919834567890", email: "tanya.k@fashion.in", group: groupFriends, status: "CONFIRMED", partySize: 1, veg: 0, nonVeg: 0, jain: 0, vegan: 1, arrival: "ON_TIME", notes: "Vegan almond milk / dairy-free" },
    { name: "Alok Saxena", phone: "+919845678901", email: "alok.saxena@gmail.com", group: groupColleagues, status: "DECLINED", partySize: 1, veg: 0, nonVeg: 0, jain: 0, vegan: 0, arrival: "LATE", notes: "Attending cousin's wedding same day" },
    { name: "Pooja Hegde", phone: "+919856789012", email: "pooja.h@gmail.com", group: groupFriends, status: "PENDING", partySize: 1, veg: 0, nonVeg: 0, jain: 0, vegan: 0, arrival: "ON_TIME", notes: "Sent reminder on WhatsApp" },
  ];

  let totalRsvps = 0;
  for (const g of guestData) {
    const guest = await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        groupId: g.group.id,
        name: g.name,
        phone: g.phone,
        email: g.email,
        notes: g.notes,
      },
    });

    // Create RSVP for each event
    for (const ev of events) {
      await prisma.rsvp.create({
        data: {
          guestId: guest.id,
          eventId: ev.id,
          status: g.status,
          partySize: g.status === "CONFIRMED" ? g.partySize : 1,
          vegCount: g.status === "CONFIRMED" ? g.veg : 0,
          nonVegCount: g.status === "CONFIRMED" ? g.nonVeg : 0,
          jainCount: g.status === "CONFIRMED" ? g.jain : 0,
          veganCount: g.status === "CONFIRMED" ? g.vegan : 0,
          arrivalTime: g.arrival,
          dietaryNotes: g.notes,
          respondedAt: g.status !== "PENDING" ? new Date() : null,
        },
      });
      totalRsvps++;
    }
  }

  console.log(`👥 Created ${guestData.length} guests with ${totalRsvps} RSVPs across all events`);
  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
