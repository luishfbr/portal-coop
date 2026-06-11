import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { GroupsService } from "./service";
import { GroupsModel } from "./model";

export const groupsController = new Elysia({
  name: "groups",
  prefix: "/api/v1/groups",
})
  .use(betterAuthPlugin)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => GroupsService.findAll(), {
        detail: { summary: "List all groups", tags: ["Groups"] },
        response: {
          200: z.array(GroupsModel.response),
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
        },
      })
      .get("/:id/permissions", ({ params: { id } }) => GroupsService.findPermissions(id), {
        params: GroupsModel.params,
        detail: { summary: "List permissions of a group", tags: ["Groups"] },
        response: {
          200: z.array(GroupsModel.permissionResponse),
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
          404: GroupsModel.errorResponse,
        },
      })
      .get("/:id/users", ({ params: { id } }) => GroupsService.findUsers(id), {
        params: GroupsModel.params,
        detail: { summary: "List users in group", tags: ["Groups"] },
        response: {
          200: z.array(GroupsModel.userResponse),
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
          404: GroupsModel.errorResponse,
        },
      })
      .put(
        "/:id/users",
        ({ params: { id }, body }) => GroupsService.setUsers(id, body.userIds),
        {
          params: GroupsModel.params,
          body: GroupsModel.setUsersBody,
          detail: { summary: "Set users for group", tags: ["Groups"] },
          response: {
            200: GroupsModel.updatedResponse,
            401: GroupsModel.errorResponse,
            403: GroupsModel.errorResponse,
            404: GroupsModel.errorResponse,
            422: GroupsModel.errorResponse,
          },
        }
      )
  );
