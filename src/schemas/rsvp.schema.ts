import { z } from "zod";

export const rsvpStatusEnum = z.enum([
  "CONFIRMED",
  "DECLINED",
  "MAYBE",
  "PENDING",
]);

export const arrivalTimeEnum = z.enum([
  "BEFORE_EVENT",
  "ON_TIME",
  "SLIGHTLY_LATE",
  "LATE",
]);

export const submitRsvpSchema = z.object({
  rsvps: z.array(
    z.object({
      eventId: z.string().min(1),
      status: rsvpStatusEnum,
      partySize: z.number().int().min(1).max(20).default(1),
      vegCount: z.number().int().min(0).max(20).default(0),
      nonVegCount: z.number().int().min(0).max(20).default(0),
      jainCount: z.number().int().min(0).max(20).default(0),
      veganCount: z.number().int().min(0).max(20).default(0),
      arrivalTime: arrivalTimeEnum.default("ON_TIME"),
      dietaryNotes: z.string().max(500).default(""),
    })
  ),
});

export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>;
export type RsvpStatus = z.infer<typeof rsvpStatusEnum>;
export type ArrivalTime = z.infer<typeof arrivalTimeEnum>;
