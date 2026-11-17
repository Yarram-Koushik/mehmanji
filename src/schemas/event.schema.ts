import { z } from "zod";

export const eventTypeEnum = z.enum([
  "MEHENDI",
  "SANGEET",
  "WEDDING",
  "RECEPTION",
  "OTHER",
]);

export const createEventSchema = z.object({
  name: z
    .string()
    .min(2, "Event name must be at least 2 characters")
    .max(100)
    .trim(),
  type: eventTypeEnum.default("OTHER"),
  eventDate: z.string().min(1, "Event date is required"),
  startTime: z.string().default(""),
  endTime: z.string().default(""),
  venue: z.string().max(300).default(""),
  address: z.string().max(500).default(""),
  sortOrder: z.number().int().default(0),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
