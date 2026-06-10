import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { AgenciesService } from "./service";
import { AgenciesModel } from "./model";

export const agenciesController = new Elysia({
  name: "org.agencies",
  prefix: "/api/v1/agencies",
})
  .use(betterAuthPlugin)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => AgenciesService.findAll(), {
        detail: { summary: "List all agencies", tags: ["Agencies"] },
        response: {
          200: z.array(AgenciesModel.responseWithCount),
          401: AgenciesModel.errorResponse,
          403: AgenciesModel.errorResponse,
        },
      })
      .post("/", async ({ body, status }) => status(201, await AgenciesService.create(body)), {
        body: AgenciesModel.create,
        detail: { summary: "Create agency", tags: ["Agencies"] },
        response: {
          201: AgenciesModel.response,
          401: AgenciesModel.errorResponse,
          403: AgenciesModel.errorResponse,
          422: AgenciesModel.errorResponse,
        },
      })
      .patch("/:id", ({ params: { id }, body }) => AgenciesService.update(id, body), {
        params: AgenciesModel.params,
        body: AgenciesModel.update,
        detail: { summary: "Update agency", tags: ["Agencies"] },
        response: {
          200: AgenciesModel.response,
          401: AgenciesModel.errorResponse,
          403: AgenciesModel.errorResponse,
          404: AgenciesModel.errorResponse,
          422: AgenciesModel.errorResponse,
        },
      })
      .delete("/:id", ({ params: { id } }) => AgenciesService.remove(id), {
        params: AgenciesModel.params,
        detail: { summary: "Delete agency", tags: ["Agencies"] },
        response: {
          200: AgenciesModel.deletedResponse,
          401: AgenciesModel.errorResponse,
          403: AgenciesModel.errorResponse,
          404: AgenciesModel.errorResponse,
          409: AgenciesModel.errorResponse,
        },
      }),
  );
