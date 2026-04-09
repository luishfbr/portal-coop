import { Elysia, t } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { ReportService } from "./service";
import { ReportModel } from "./model";

const ACCEPTED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
] as const;

export const analyticsReportsController = new Elysia({
  name: "analytics.reports",
  prefix: "/reports",
})
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => ReportService.findAll(), {
        detail: {
          summary: "List all analytics reports",
          tags: ["Governança Analítica - Relatórios"],
        },
      })

      .get("/:id", ({ params: { id } }) => ReportService.findById(id), {
        params: ReportModel.params,
        detail: {
          summary: "Get analytics report by id",
          tags: ["Governança Analítica - Relatórios"],
        },
      })

      .post(
        "/",
        ({ body }) =>
          ReportService.create({
            name: body.name,
            slug: body.slug,
            file: body.file,
          }),
        {
          body: t.Object({
            name: t.String({ minLength: 2, maxLength: 200 }),
            slug: t.String({
              minLength: 1,
              maxLength: 63,
              pattern: "^[a-z_][a-z0-9_]*$",
            }),
            file: t.File({
              type: ACCEPTED_MIME_TYPES,
              maxSize: "50m",
            }),
          }),
          detail: {
            summary: "Upload a new analytics report",
            tags: ["Governança Analítica - Relatórios"],
          },
        }
      )

      .put(
        "/:id",
        ({ params: { id }, body }) =>
          ReportService.update(id, {
            name: body.name,
            file: body.file,
          }),
        {
          params: ReportModel.params,
          body: t.Object({
            name: t.Optional(t.String({ minLength: 2, maxLength: 200 })),
            file: t.Optional(
              t.File({
                type: ACCEPTED_MIME_TYPES,
                maxSize: "50m",
              })
            ),
          }),
          detail: {
            summary: "Re-upload or rename an analytics report",
            tags: ["Governança Analítica - Relatórios"],
          },
        }
      )

      .delete("/:id", ({ params: { id } }) => ReportService.remove(id), {
        params: ReportModel.params,
        detail: {
          summary: "Delete analytics report and drop its table",
          tags: ["Governança Analítica - Relatórios"],
        },
      })
  );
