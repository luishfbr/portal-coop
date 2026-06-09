import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { AreasService } from "./service";
import { AreasModel } from "./model";

export const areasController = new Elysia({
  name: "org.sectors.areas",
  prefix: "/api/v1/sectors/:sectorId/areas",
})
  .use(betterAuthPlugin)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", ({ params: { sectorId } }) => AreasService.findBySector(sectorId), {
        params: AreasModel.sectorParams,
        detail: {
          summary: "List areas of a sector",
          description: "Retorna as áreas de um setor. Retorna 404 se o setor não existir.",
          tags: ["Areas"],
        },
        response: {
          200: z.array(AreasModel.response),
          401: AreasModel.errorResponse,
          403: AreasModel.errorResponse,
          404: AreasModel.errorResponse,
        },
      })
      .post("/", ({ params: { sectorId }, body }) => AreasService.create(sectorId, body), {
        params: AreasModel.sectorParams,
        body: AreasModel.create,
        detail: {
          summary: "Create area in sector",
          description: "Cria uma área no setor. Retorna 404 se o setor não existir.",
          tags: ["Areas"],
        },
        response: {
          200: AreasModel.response,
          401: AreasModel.errorResponse,
          403: AreasModel.errorResponse,
          404: AreasModel.errorResponse,
          422: AreasModel.errorResponse,
        },
      })
      .patch("/:id", ({ params: { sectorId, id }, body }) => AreasService.update(sectorId, id, body), {
        params: AreasModel.params,
        body: AreasModel.update,
        detail: { summary: "Update area", tags: ["Areas"] },
        response: {
          200: AreasModel.response,
          401: AreasModel.errorResponse,
          403: AreasModel.errorResponse,
          404: AreasModel.errorResponse,
          422: AreasModel.errorResponse,
        },
      })
      .patch("/:id/toggle", ({ params: { sectorId, id } }) => AreasService.toggle(sectorId, id), {
        params: AreasModel.params,
        detail: { summary: "Toggle area active status", tags: ["Areas"] },
        response: {
          200: AreasModel.response,
          401: AreasModel.errorResponse,
          403: AreasModel.errorResponse,
          404: AreasModel.errorResponse,
        },
      })
      .delete("/:id", ({ params: { sectorId, id } }) => AreasService.remove(sectorId, id), {
        params: AreasModel.params,
        detail: { summary: "Delete area", tags: ["Areas"] },
        response: {
          200: AreasModel.deletedResponse,
          401: AreasModel.errorResponse,
          403: AreasModel.errorResponse,
          404: AreasModel.errorResponse,
        },
      }),
  );
