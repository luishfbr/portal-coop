import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { JobFunctionsService } from "./service";
import { JobFunctionsModel } from "./model";

export const jobFunctionsController = new Elysia({
  name: "org.job-functions",
  prefix: "/api/v1/job-functions",
})
  .use(betterAuthPlugin)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => JobFunctionsService.findAll(), {
        detail: { summary: "List all job functions", tags: ["Job Functions"] },
        response: {
          200: z.array(JobFunctionsModel.responseWithCount),
          401: JobFunctionsModel.errorResponse,
          403: JobFunctionsModel.errorResponse,
        },
      })
      .get("/:id/users", ({ params: { id } }) => JobFunctionsService.findUsers(id), {
        params: JobFunctionsModel.params,
        detail: { summary: "List users assigned to job function", tags: ["Job Functions"] },
        response: {
          200: z.array(JobFunctionsModel.usersResponse),
          401: JobFunctionsModel.errorResponse,
          403: JobFunctionsModel.errorResponse,
          404: JobFunctionsModel.errorResponse,
        },
      })
      .post("/", async ({ body, status }) => status(201, await JobFunctionsService.create(body)), {
        body: JobFunctionsModel.create,
        detail: { summary: "Create job function", tags: ["Job Functions"] },
        response: {
          201: JobFunctionsModel.response,
          401: JobFunctionsModel.errorResponse,
          403: JobFunctionsModel.errorResponse,
          422: JobFunctionsModel.errorResponse,
        },
      })
      .patch("/:id", ({ params: { id }, body }) => JobFunctionsService.update(id, body), {
        params: JobFunctionsModel.params,
        body: JobFunctionsModel.update,
        detail: { summary: "Update job function", tags: ["Job Functions"] },
        response: {
          200: JobFunctionsModel.response,
          401: JobFunctionsModel.errorResponse,
          403: JobFunctionsModel.errorResponse,
          404: JobFunctionsModel.errorResponse,
          422: JobFunctionsModel.errorResponse,
        },
      })
      .delete("/:id", ({ params: { id } }) => JobFunctionsService.remove(id), {
        params: JobFunctionsModel.params,
        detail: { summary: "Delete job function", tags: ["Job Functions"] },
        response: {
          200: JobFunctionsModel.deletedResponse,
          401: JobFunctionsModel.errorResponse,
          403: JobFunctionsModel.errorResponse,
          404: JobFunctionsModel.errorResponse,
          409: JobFunctionsModel.errorResponse,
        },
      }),
  );
