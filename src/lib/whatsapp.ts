import { generateInviteMessage, generateWhatsAppLink, formatDate } from "./utils";
import type { Guest, Wedding } from "@prisma/client";

export function createWhatsAppShareUrl(
  guest: Guest,
  wedding: Wedding
): string {
  const message = generateInviteMessage(
    guest.name,
    wedding.familyName,
    formatDate(wedding.weddingDate),
    guest.token
  );

  if (guest.phone) {
    return generateWhatsAppLink(guest.phone, message);
  }

  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

export function createBulkShareMessage(
  wedding: Wedding,
  rsvpBaseUrl: string
): string {
  return `🎊 You are invited to the ${wedding.familyName}!

📅 Date: ${formatDate(wedding.weddingDate)}
📍 Venue: ${wedding.venue}, ${wedding.city}

Please RSVP at: ${rsvpBaseUrl}

We look forward to celebrating with you! 🎉`;
}
