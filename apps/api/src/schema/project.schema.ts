import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, `Project name is required`)
    .max(100, "Project name must be 100 characters or less"),
  description: z
    .string()
    .trim()
    .max(500, `Description must be 500 characters or less`)
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Project name must be 100 characters or less")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, `Description must be 500 characters or less`)
    .optional(),
});

export const projectParamsSchema = z.object({
  projectId: z.string().min(1, `Project ID is required`),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectParamsInput = z.infer<typeof projectParamsSchema>;
