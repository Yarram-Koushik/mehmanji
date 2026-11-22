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
  const weddingTitle = wedding.familyName.trim().toLowerCase().startsWith("the ")
    ? wedding.familyName.trim()
    : `the ${wedding.familyName.trim()}`;

  return `Namaste! 🙏 You are cordially invited to ${weddingTitle}! ✨

• Date: ${formatDate(wedding.weddingDate)}
• Venue: ${wedding.venue}, ${wedding.city}

Please confirm your attendance here:
${rsvpBaseUrl}

Looking forward to celebrating with you! 🎊`;
}
