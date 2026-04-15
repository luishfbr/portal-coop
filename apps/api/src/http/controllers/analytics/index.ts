import { Elysia } from "elysia";
import { analyticsReportsController } from "./reports";

export const analyticsController = new Elysia({ prefix: "/api/v1/analytics" })
  .use(analyticsReportsController);
