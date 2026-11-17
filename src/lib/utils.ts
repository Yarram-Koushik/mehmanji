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
  const cleanPhone = phone.replace(/\D/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function generateRsvpUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/rsvp/${token}`;
}

export function generateInviteMessage(
  guestName: string,
  familyName: string,
  weddingDate: string,
  token: string
): string {
  const rsvpUrl = generateRsvpUrl(token);
  return `🎊 Namaste ${guestName}!

You are cordially invited to the ${familyName} on ${weddingDate}!

Please confirm your attendance here:
${rsvpUrl}

We'd love to know:
✅ Are you coming?
👥 How many people?
🥗 Food preference (Veg/Non-Veg)

Looking forward to celebrating with you! 🎉`;
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
