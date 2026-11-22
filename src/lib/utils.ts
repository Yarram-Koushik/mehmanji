import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export function generateWhatsAppLink(phone: string, message: string): string {
  let cleanPhone = phone.replace(/\D/g, "");
  // If 10-digit Indian number without country code, add 91
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }
  const encodedMessage = encodeURIComponent(message);

  // Desktop browsers should use web.whatsapp.com directly so Windows protocol handlers don't corrupt UTF-8 emojis into '?'
  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  return isMobile
    ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
}

export function generateRsvpUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005";
  return `${baseUrl}/rsvp/${token}`;
}

export function generateInviteMessage(
  guestName: string,
  familyName: string,
  weddingDate: string,
  token: string,
  customOrigin?: string
): string {
  const baseUrl =
    customOrigin ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3005");
  const rsvpUrl = `${baseUrl}/rsvp/${token}`;
  const weddingTitle = familyName.trim().toLowerCase().startsWith("the ")
    ? familyName.trim()
    : `the ${familyName.trim()}`;

  return `Namaste ${guestName}! 🙏

You are cordially invited to ${weddingTitle} on ${weddingDate}! ✨

Please confirm your attendance here:
${rsvpUrl}

Kindly let us know:
• Are you attending?
• Number of family members?
• Food preference (Veg / Non-Veg / Jain)

Looking forward to celebrating with you! 🎊`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * Parses a time string (e.g. "3:00 PM", "7:30 PM", "11:00 AM", "18:00")
 * into minutes from midnight (0 - 1439) for accurate chronological comparison.
 */
export function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 9999;
  const clean = timeStr.trim();
  if (!clean || clean.toUpperCase() === "TBD") return 9999;

  // 12-hour format e.g. "3:00 PM", "07:30 PM", "6 PM", "11:30 am"
  const match12 = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (match12) {
    let hours = parseInt(match12[1], 10);
    const minutes = match12[2] ? parseInt(match12[2], 10) : 0;
    const period = match12[3].toUpperCase();

    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  // 24-hour format e.g. "15:00", "09:30"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    const hours = parseInt(match24[1], 10);
    const minutes = parseInt(match24[2], 10);
    return hours * 60 + minutes;
  }

  return 9999;
}

/**
 * Sorts wedding events/ceremonies strictly chronologically:
 * 1. By Event Date (earliest date first)
 * 2. By Start Time (earliest time first, e.g. 11:00 AM -> 3:00 PM -> 6:00 PM -> 7:30 PM)
 * 3. Fallback to sortOrder or name
 */
export function sortEventsChronologically<
  T extends { eventDate: Date | string; startTime?: string | null; sortOrder?: number; name?: string }
>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    // 1. Compare Date by YYYY-MM-DD
    const dateStrA = a.eventDate instanceof Date
      ? a.eventDate.toISOString().split("T")[0]
      : new Date(a.eventDate).toISOString().split("T")[0];
    const dateStrB = b.eventDate instanceof Date
      ? b.eventDate.toISOString().split("T")[0]
      : new Date(b.eventDate).toISOString().split("T")[0];

    if (dateStrA !== dateStrB) {
      return dateStrA.localeCompare(dateStrB);
    }

    // 2. Same date: Compare Start Time in minutes
    const timeA = parseTimeToMinutes(a.startTime);
    const timeB = parseTimeToMinutes(b.startTime);
    if (timeA !== timeB) {
      return timeA - timeB;
    }

    // 3. Fallback to sortOrder
    const orderA = a.sortOrder ?? 0;
    const orderB = b.sortOrder ?? 0;
    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}
