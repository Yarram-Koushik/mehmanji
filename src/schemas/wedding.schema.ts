import { z } from "zod";

export const createWeddingSchema = z.object({
  brideName: z
    .string()
    .min(2, "Bride name must be at least 2 characters")
    .max(100)
    .trim(),
  groomName: z
    .string()
    .min(2, "Groom name must be at least 2 characters")
    .max(100)
    .trim(),
  familyName: z
    .string()
    .min(2, "Family name must be at least 2 characters")
    .max(200)
    .trim(),
  weddingDate: z.string().min(1, "Wedding date is required"),
  venue: z
    .string()
    .min(2, "Venue must be at least 2 characters")
    .max(300)
    .trim(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100)
    .trim(),
  themeColor: z.string().default("#B91C6C"),
});

export const updateWeddingSchema = createWeddingSchema.partial();

export type CreateWeddingInput = z.infer<typeof createWeddingSchema>;
export type UpdateWeddingInput = z.infer<typeof updateWeddingSchema>;
