import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { SectorsService } from "./service";
import { SectorsModel } from "./model";
import { areasController } from "./areas";

export const sectorsController = new Elysia({
  name: "org.sectors",
  prefix: "/api/v1/sectors",
})
  .use(betterAuthPlugin)
  .use(areasController)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => SectorsService.findAll(), {
        detail: { summary: "List all sectors", tags: ["Sectors"] },
        response: {
          200: z.array(SectorsModel.responseWithAreas),
          401: SectorsModel.errorResponse,
          403: SectorsModel.errorResponse,
        },
      })
      .post("/", ({ body }) => SectorsService.create(body), {
        body: SectorsModel.create,
        detail: { summary: "Create sector", tags: ["Sectors"] },
        response: {
          200: SectorsModel.response,
          401: SectorsModel.errorResponse,
          403: SectorsModel.errorResponse,
          422: SectorsModel.errorResponse,
        },
      })
      .patch("/:id", ({ params: { id }, body }) => SectorsService.update(id, body), {
        params: SectorsModel.params,
        body: SectorsModel.update,
        detail: { summary: "Update sector", tags: ["Sectors"] },
        response: {
          200: SectorsModel.response,
          401: SectorsModel.errorResponse,
          403: SectorsModel.errorResponse,
          404: SectorsModel.errorResponse,
          422: SectorsModel.errorResponse,
        },
      })
      .patch("/:id/toggle", ({ params: { id } }) => SectorsService.toggle(id), {
        params: SectorsModel.params,
        detail: { summary: "Toggle sector active status", tags: ["Sectors"] },
        response: {
          200: SectorsModel.response,
          401: SectorsModel.errorResponse,
          403: SectorsModel.errorResponse,
          404: SectorsModel.errorResponse,
        },
      })
      .delete("/:id", ({ params: { id } }) => SectorsService.remove(id), {
        params: SectorsModel.params,
        detail: {
          summary: "Delete sector",
          description: "Remove o setor e exclui em cascata todas as áreas associadas.",
          tags: ["Sectors"],
        },
        response: {
          200: SectorsModel.deletedResponse,
          401: SectorsModel.errorResponse,
          403: SectorsModel.errorResponse,
          404: SectorsModel.errorResponse,
        },
      }),
  );
