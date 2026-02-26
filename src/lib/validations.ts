import { z } from "zod";

export const BookSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  author: z.string().min(1, "Author is required").max(255),
  isbn: z.string().max(13).optional().or(z.literal("")),
  cover: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: z.string().max(100).optional().or(z.literal("")),
  totalCopies: z.coerce.number().int().min(1).max(100),
});

export type BookInput = z.infer<typeof BookSchema>;

export const LoanSchema = z.object({
  bookId: z.string().cuid(),
});

export type LoanInput = z.infer<typeof LoanSchema>;
