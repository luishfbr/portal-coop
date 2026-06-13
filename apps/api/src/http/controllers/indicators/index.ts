import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { IndicatorsService } from "./service";
import { IndicatorsModel } from "./model";
import { valuesController } from "./values";

export const indicatorsController = new Elysia({
  name: "indicators",
  prefix: "/api/v1/indicators",
})
  .use(betterAuthPlugin)
  .use(valuesController)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => IndicatorsService.findAll(), {
        detail: { summary: "List all indicators", tags: ["Indicators"] },
        response: {
          200: z.array(IndicatorsModel.responseWithSector),
          401: IndicatorsModel.errorResponse,
          403: IndicatorsModel.errorResponse,
        },
      })
      .get("/:id", ({ params: { id } }) => IndicatorsService.findById(id), {
        params: IndicatorsModel.params,
        detail: { summary: "Get indicator by id", tags: ["Indicators"] },
        response: {
          200: IndicatorsModel.responseWithSector,
          401: IndicatorsModel.errorResponse,
          403: IndicatorsModel.errorResponse,
          404: IndicatorsModel.errorResponse,
        },
      })
      .post(
        "/",
        ({ body }) => IndicatorsService.create(body),
        {
          body: IndicatorsModel.create,
          detail: { summary: "Create indicator", tags: ["Indicators"] },
          response: {
            200: IndicatorsModel.response,
            401: IndicatorsModel.errorResponse,
            403: IndicatorsModel.errorResponse,
            409: IndicatorsModel.errorResponse,
            422: IndicatorsModel.errorResponse,
          },
        },
      )
      .patch(
        "/:id",
        ({ params: { id }, body }) => IndicatorsService.update(id, body),
        {
          params: IndicatorsModel.params,
          body: IndicatorsModel.update,
          detail: { summary: "Update indicator", tags: ["Indicators"] },
          response: {
            200: IndicatorsModel.response,
            401: IndicatorsModel.errorResponse,
            403: IndicatorsModel.errorResponse,
            404: IndicatorsModel.errorResponse,
            409: IndicatorsModel.errorResponse,
            422: IndicatorsModel.errorResponse,
          },
        },
      )
      .delete(
        "/:id",
        ({ params: { id } }) => IndicatorsService.remove(id),
        {
          params: IndicatorsModel.params,
          detail: { summary: "Delete indicator", tags: ["Indicators"] },
          response: {
            200: IndicatorsModel.deletedResponse,
            401: IndicatorsModel.errorResponse,
            403: IndicatorsModel.errorResponse,
            404: IndicatorsModel.errorResponse,
          },
        },
      ),
  );
