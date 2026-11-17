import type { Wedding, Event, Guest, Rsvp, GuestGroup, User } from "@prisma/client";

export type WeddingWithRelations = Wedding & {
  events: Event[];
  guests: (Guest & {
    rsvps: Rsvp[];
    group: GuestGroup | null;
  })[];
  guestGroups: GuestGroup[];
  _count?: {
    guests: number;
    events: number;
  };
};

export type GuestWithRsvps = Guest & {
  rsvps: Rsvp[];
  group: GuestGroup | null;
};

export type EventWithRsvps = Event & {
  rsvps: (Rsvp & {
    guest: Guest;
  })[];
};

export type RsvpWithGuest = Rsvp & {
  guest: Guest;
  event: Event;
};

export type DashboardStats = {
  totalWeddings: number;
  totalGuests: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  totalMaybe: number;
  upcomingWeddings: WeddingWithStats[];
};

export type WeddingWithStats = Wedding & {
  _count: {
    guests: number;
    events: number;
  };
  stats: {
    confirmed: number;
    declined: number;
    maybe: number;
    pending: number;
    totalPartySize: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
    veganCount: number;
  };
};

export type CateringReport = {
  eventId: string;
  eventName: string;
  eventDate: string;
  totalConfirmed: number;
  totalPartySize: number;
  vegCount: number;
  nonVegCount: number;
  jainCount: number;
  veganCount: number;
  bufferRecommendation: number;
  guestBreakdown: {
    guestName: string;
    partySize: number;
    vegCount: number;
    nonVegCount: number;
    jainCount: number;
    veganCount: number;
    dietaryNotes: string;
  }[];
};

export type SafeUser = Omit<User, "passwordHash">;
