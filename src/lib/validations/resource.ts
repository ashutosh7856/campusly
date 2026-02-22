import { z } from "zod";

export const uploadResourceSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  type: z.enum(["NOTES", "PYQ", "ASSIGNMENT", "SYLLABUS", "OTHER"]),
  subject: z.string().min(1, "Subject is required"),
  semester: z.coerce.number().min(1, "Semester must be at least 1").max(12),
  branch: z.string().min(1, "Branch is required"),
});

export type UploadResourceInput = z.infer<typeof uploadResourceSchema>;
