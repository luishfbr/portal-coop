import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { ValuesService } from "./service";
import { ValuesModel } from "./model";

export const valuesController = new Elysia({
  name: "indicators.values",
  prefix: "/:id/values",
})
  .use(betterAuthPlugin)
  .guard({ adminOnly: true }, (app) =>
    app
      .get(
        "/",
        ({ params: { id }, query }) =>
          ValuesService.findByIndicator(id, query),
        {
          params: ValuesModel.indicatorParams,
          query: ValuesModel.query,
          detail: { summary: "List values for an indicator", tags: ["Indicator Values"] },
          response: {
            200: z.array(ValuesModel.response),
            401: ValuesModel.errorResponse,
            403: ValuesModel.errorResponse,
            404: ValuesModel.errorResponse,
          },
        },
      )
      .post(
        "/",
        ({ params: { id }, body }) => ValuesService.create(id, body),
        {
          params: ValuesModel.indicatorParams,
          body: ValuesModel.create,
          detail: { summary: "Create indicator value", tags: ["Indicator Values"] },
          response: {
            200: ValuesModel.response,
            401: ValuesModel.errorResponse,
            403: ValuesModel.errorResponse,
            404: ValuesModel.errorResponse,
            409: ValuesModel.errorResponse,
            422: ValuesModel.errorResponse,
          },
        },
      )
      .patch(
        "/:valueId",
        ({ params: { id, valueId }, body }) =>
          ValuesService.update(id, valueId, body),
        {
          params: ValuesModel.params,
          body: ValuesModel.update,
          detail: { summary: "Update indicator value", tags: ["Indicator Values"] },
          response: {
            200: ValuesModel.response,
            401: ValuesModel.errorResponse,
            403: ValuesModel.errorResponse,
            404: ValuesModel.errorResponse,
            422: ValuesModel.errorResponse,
          },
        },
      )
      .delete(
        "/:valueId",
        ({ params: { id, valueId } }) => ValuesService.remove(id, valueId),
        {
          params: ValuesModel.params,
          detail: { summary: "Delete indicator value", tags: ["Indicator Values"] },
          response: {
            200: ValuesModel.deletedResponse,
            401: ValuesModel.errorResponse,
            403: ValuesModel.errorResponse,
            404: ValuesModel.errorResponse,
          },
        },
      ),
  );
