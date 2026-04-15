import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { PermissionService } from "./service";
import { PermissionModel } from "./model";

export const permissionsController = new Elysia({
  name: "rbac.permissions",
  prefix: "/permissions",
})
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  // ── Rotas públicas ─────────────────────────────────────────────────────────
  .get("/", () => PermissionService.findAll(), {
    detail: { summary: "List all permissions", tags: ["RBAC - Permissions"] },
  })
  // Rota literal registrada antes da parametrizada para evitar conflito
  .get(
    "/by-module/:moduleId",
    ({ params: { moduleId } }) => PermissionService.findByModule(moduleId),
    {
      params: PermissionModel.moduleParams,
      detail: {
        summary: "List permissions by module",
        tags: ["RBAC - Permissions"],
      },
    }
  )
  .get("/:id", ({ params: { id } }) => PermissionService.findById(id), {
    params: PermissionModel.params,
    detail: { summary: "Get permission by id", tags: ["RBAC - Permissions"] },
  })

  // ── Rotas protegidas (admin) ────────────────────────────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .post("/", ({ body }) => PermissionService.create(body), {
        body: PermissionModel.create,
        detail: { summary: "Create permission", tags: ["RBAC - Permissions"] },
      })
      .put(
        "/:id",
        ({ params: { id }, body }) => PermissionService.update(id, body),
        {
          params: PermissionModel.params,
          body: PermissionModel.update,
          detail: {
            summary: "Update permission",
            tags: ["RBAC - Permissions"],
          },
        }
      )
      .delete("/:id", ({ params: { id } }) => PermissionService.remove(id), {
        params: PermissionModel.params,
        detail: {
          summary: "Delete permission",
          tags: ["RBAC - Permissions"],
        },
      })
  );
