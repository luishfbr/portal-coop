import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { SiteConfigService } from "./service";
import { SiteConfigModel } from "./model";

export const siteConfigController = new Elysia({
  name: "config.site",
  prefix: "/api/v1/config",
})
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })
  .get("/", () => SiteConfigService.get(), {
    auth: true,
    detail: { summary: "Get site config", tags: ["Config"] },
  })
  .put("/", ({ body }) => SiteConfigService.update(body), {
    adminOnly: true,
    body: SiteConfigModel.update,
    detail: { summary: "Update site config", tags: ["Config"] },
  });
