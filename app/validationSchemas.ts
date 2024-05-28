import { z } from "zod";

export const issueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required").max(65535),
  status: z.string().min(1, "Status is required").optional(),
});

export const patchIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(65535)
    .optional(),
  status: z.string().min(1, "Status is required").optional(),
  assignedToUserId: z
    .string()
    .min(1, "AssignedToUserId is required")
    .max(255)
    .optional()
    .nullable(),
  relatedIssueId: z
    .string()
    .min(1, "Related IssueId is Required")
    .regex(/^\d{8}-\d+$/, "Must be a valid IssueId")
    .optional(),
});

export const filterIssueSchema = z.object({
  status: z.string().min(1, "Status is required").optional(),
  assignedToUserId: z
    .string()
    .min(1, "AssignedToUserId is required")
    .optional(),
});
export const commentSchema = z.object({
  detail: z.string().min(1, "Detail is required").max(255),
});
