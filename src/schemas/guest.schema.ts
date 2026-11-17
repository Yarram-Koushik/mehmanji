import { z } from "zod";

export const createGuestSchema = z.object({
  name: z
    .string()
    .min(1, "Guest name is required")
    .max(100)
    .trim(),
  phone: z.string().max(15).default(""),
  email: z.string().email().max(255).or(z.literal("")).default(""),
  groupId: z.string().nullable().default(null),
  notes: z.string().max(500).default(""),
});

export const updateGuestSchema = createGuestSchema.partial();

export const createGuestGroupSchema = z.object({
  name: z
    .string()
    .min(1, "Group name is required")
    .max(50)
    .trim(),
  color: z.string().default("#6B7280"),
});

export const bulkImportSchema = z.object({
  guests: z.array(
    z.object({
      name: z.string().min(1).max(100).trim(),
      phone: z.string().max(15).default(""),
      email: z.string().email().or(z.literal("")).default(""),
      groupId: z.string().nullable().default(null),
    })
  ),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;
export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;
export type CreateGuestGroupInput = z.infer<typeof createGuestGroupSchema>;
export type BulkImportInput = z.infer<typeof bulkImportSchema>;
