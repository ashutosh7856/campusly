import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  content: z
    .string()
    .min(10, "Content must be at least 10 characters")
    .max(5000, "Content must be less than 5000 characters"),
  category: z.enum([
    "ANNOUNCEMENT",
    "DISCUSSION",
    "LOST_FOUND",
    "BUYING_SELLING",
    "HELP",
    "GENERAL",
  ]),
  image: z.string().url().optional().or(z.literal("")),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
