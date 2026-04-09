import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { GroupPermissionService } from "./service";
import { GroupPermissionModel } from "./model";

export const groupPermissionsController = new Elysia({
  name: "rbac.group-permissions",
  prefix: "/group-permissions",
})
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  // ── Todas as rotas requerem autenticação de admin ──────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => GroupPermissionService.findAll(), {
        detail: {
          summary: "List all group permissions",
          tags: ["RBAC - Group Permissions"],
        },
      })
      .get(
        "/by-group/:groupId",
        ({ params: { groupId } }) =>
          GroupPermissionService.findByGroup(groupId),
        {
          params: GroupPermissionModel.groupParams,
          detail: {
            summary: "List permissions of a group",
            tags: ["RBAC - Group Permissions"],
          },
        }
      )
      .post("/", ({ body }) => GroupPermissionService.create(body), {
        body: GroupPermissionModel.create,
        detail: {
          summary: "Assign permission to group",
          tags: ["RBAC - Group Permissions"],
        },
      })
      .delete(
        "/:id",
        ({ params: { id } }) => GroupPermissionService.remove(id),
        {
          params: GroupPermissionModel.params,
          detail: {
            summary: "Remove permission from group",
            tags: ["RBAC - Group Permissions"],
          },
        }
      )
  );
