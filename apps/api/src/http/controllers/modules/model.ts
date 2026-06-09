import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { modules } from "@/db/schema";

const _select = createSelectSchema(modules);

export const ModulesModel = {
  response: _select,
  params: z.object({ id: z.string() }),
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
};

export type ModuleResponse = z.infer<typeof ModulesModel.response>;
