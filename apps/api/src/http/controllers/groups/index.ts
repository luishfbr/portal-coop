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
      .post("/", ({ body }) => GroupsService.create(body), {
        body: GroupsModel.create,
        detail: { summary: "Create group", tags: ["Groups"] },
        response: {
          200: GroupsModel.response,
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
          422: GroupsModel.errorResponse,
        },
      })
      .patch("/:id", ({ params: { id }, body }) => GroupsService.update(id, body), {
        params: GroupsModel.params,
        body: GroupsModel.update,
        detail: { summary: "Update group", tags: ["Groups"] },
        response: {
          200: GroupsModel.response,
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
          404: GroupsModel.errorResponse,
          422: GroupsModel.errorResponse,
        },
      })
      .delete("/:id", ({ params: { id } }) => GroupsService.remove(id), {
        params: GroupsModel.params,
        detail: { summary: "Delete group", tags: ["Groups"] },
        response: {
          200: GroupsModel.deletedResponse,
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
          404: GroupsModel.errorResponse,
        },
      })
      .get("/:id/modules", ({ params: { id } }) => GroupsService.findModules(id), {
        params: GroupsModel.params,
        detail: { summary: "List modules assigned to group", tags: ["Groups"] },
        response: {
          200: z.array(GroupsModel.moduleResponse),
          401: GroupsModel.errorResponse,
          403: GroupsModel.errorResponse,
          404: GroupsModel.errorResponse,
        },
      })
      .put(
        "/:id/modules",
        ({ params: { id }, body }) => GroupsService.setModules(id, body.moduleIds),
        {
          params: GroupsModel.params,
          body: GroupsModel.setModulesBody,
          detail: { summary: "Set modules for group", tags: ["Groups"] },
          response: {
            200: GroupsModel.updatedResponse,
            401: GroupsModel.errorResponse,
            403: GroupsModel.errorResponse,
            404: GroupsModel.errorResponse,
            422: GroupsModel.errorResponse,
          },
        }
      )
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
