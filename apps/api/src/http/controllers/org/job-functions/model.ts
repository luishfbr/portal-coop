import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { jobFunctions } from "@/db/schema";

const _insert = createInsertSchema(jobFunctions, {
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
});

const _update = createUpdateSchema(jobFunctions, {
  name: z.string().min(2).max(100),
  description: z.string().max(255).optional(),
});

const _select = createSelectSchema(jobFunctions);

export const JobFunctionsModel = {
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  responseWithCount: _select.extend({ userCount: z.number() }),
  usersResponse: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  params: z.object({ id: z.string() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type CreateJobFunction = z.infer<typeof JobFunctionsModel.create>;
export type UpdateJobFunction = z.infer<typeof JobFunctionsModel.update>;
export type JobFunctionResponse = z.infer<typeof JobFunctionsModel.response>;
export type JobFunctionUserResponse = z.infer<typeof JobFunctionsModel.usersResponse>;
