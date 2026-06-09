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
  .get("/active", () => ModulesService.findActive(), {
    auth: true,
    detail: { summary: "List active modules", tags: ["Modules"] },
    response: {
      200: z.array(ModulesModel.response),
      401: ModulesModel.errorResponse,
    },
  })
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => ModulesService.findAll(), {
        detail: { summary: "List all modules", tags: ["Modules"] },
        response: {
          200: z.array(ModulesModel.response),
          401: ModulesModel.errorResponse,
          403: ModulesModel.errorResponse,
        },
      })
      .patch("/:id/toggle", ({ params: { id } }) => ModulesService.toggle(id), {
        params: ModulesModel.params,
        detail: { summary: "Toggle module active status", tags: ["Modules"] },
        response: {
          200: ModulesModel.response,
          401: ModulesModel.errorResponse,
          403: ModulesModel.errorResponse,
          404: ModulesModel.errorResponse,
        },
      })
  );
