import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { UserGroupService } from "./service";
import { UserGroupModel } from "./model";

export const userGroupsController = new Elysia({
  name: "rbac.user-groups",
  prefix: "/user-groups",
})
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  // ── Todas as rotas requerem autenticação de admin ──────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .get(
        "/by-group/:groupId",
        ({ params: { groupId } }) => UserGroupService.findByGroup(groupId),
        {
          params: UserGroupModel.groupParams,
          detail: {
            summary: "List users in a group",
            tags: ["RBAC - User Groups"],
          },
        }
      )
      .get(
        "/by-user/:userId",
        ({ params: { userId } }) => UserGroupService.findByUser(userId),
        {
          params: UserGroupModel.userParams,
          detail: {
            summary: "List groups of a user (with permissions)",
            tags: ["RBAC - User Groups"],
          },
        }
      )
      .post("/", ({ body }) => UserGroupService.create(body), {
        body: UserGroupModel.create,
        detail: {
          summary: "Add user to group",
          tags: ["RBAC - User Groups"],
        },
      })
      .delete("/:id", ({ params: { id } }) => UserGroupService.remove(id), {
        params: UserGroupModel.params,
        detail: {
          summary: "Remove user from group",
          tags: ["RBAC - User Groups"],
        },
      })
  );
