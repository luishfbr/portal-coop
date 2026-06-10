import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { ModulesService } from "./service";
import { ModulesModel } from "./model";

export const modulesController = new Elysia({
  name: "modules",
  prefix: "/api/v1/modules",
})
  .use(betterAuthPlugin)
  .get("/active", ({ user }) => ModulesService.findActive(user.id), {
    auth: true,
    detail: { summary: "List accessible modules for the current user", tags: ["Modules"] },
    response: {
      200: z.array(ModulesModel.response),
      401: ModulesModel.errorResponse,
    },
  })
  .get("/", () => ModulesService.findAll(), {
    auth: true,
    detail: { summary: "List all modules", tags: ["Modules"] },
    response: {
      200: z.array(ModulesModel.response),
      401: ModulesModel.errorResponse,
    },
  });
