import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { ModuleService } from "./service";
import { ModuleModel } from "./model";

export const modulesController = new Elysia({ name: "rbac.modules", prefix: "/modules" })
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  // ── Rotas públicas ─────────────────────────────────────────────────────────
  .get("/", () => ModuleService.findAll(), {
    detail: { summary: "List all modules", tags: ["RBAC - Modules"] },
  })
  .get("/:id", ({ params: { id } }) => ModuleService.findById(id), {
    params: ModuleModel.params,
    detail: { summary: "Get module by id", tags: ["RBAC - Modules"] },
  })

  // ── Rotas protegidas (admin) ────────────────────────────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .post("/", ({ body }) => ModuleService.create(body), {
        body: ModuleModel.create,
        detail: { summary: "Create module", tags: ["RBAC - Modules"] },
      })
      .put("/:id", ({ params: { id }, body }) => ModuleService.update(id, body), {
        params: ModuleModel.params,
        body: ModuleModel.update,
        detail: { summary: "Update module", tags: ["RBAC - Modules"] },
      })
      .delete("/:id", ({ params: { id } }) => ModuleService.remove(id), {
        params: ModuleModel.params,
        detail: { summary: "Delete module", tags: ["RBAC - Modules"] },
      })
  );
