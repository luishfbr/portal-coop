import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { ModulesService } from "./service";
import { ModulesModel } from "./model";

export const modulesController = new Elysia({
  name: "modules",
  prefix: "/api/v1/modules",
})
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })
  .get("/active", () => ModulesService.findActive(), {
    auth: true,
    detail: { summary: "List active modules", tags: ["Modules"] },
  })
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => ModulesService.findAll(), {
        detail: { summary: "List all modules", tags: ["Modules"] },
      })
      .patch("/:id/toggle", ({ params: { id } }) => ModulesService.toggle(id), {
        params: ModulesModel.params,
        detail: { summary: "Toggle module active status", tags: ["Modules"] },
      })
  );
