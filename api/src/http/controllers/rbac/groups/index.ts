import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { GroupService } from "./service";
import { GroupModel } from "./model";

export const groupsController = new Elysia({ name: "rbac.groups", prefix: "/groups" })
  .use(betterAuthPlugin)
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  // ── Rotas públicas ─────────────────────────────────────────────────────────
  .get("/", () => GroupService.findAll(), {
    detail: { summary: "List all groups", tags: ["RBAC - Groups"] },
  })
  .get("/:id", ({ params: { id } }) => GroupService.findById(id), {
    params: GroupModel.params,
    detail: { summary: "Get group by id", tags: ["RBAC - Groups"] },
  })

  // ── Rotas protegidas (admin) ────────────────────────────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .post("/", ({ body }) => GroupService.create(body), {
        body: GroupModel.create,
        detail: { summary: "Create group", tags: ["RBAC - Groups"] },
      })
      .put("/:id", ({ params: { id }, body }) => GroupService.update(id, body), {
        params: GroupModel.params,
        body: GroupModel.update,
        detail: { summary: "Update group", tags: ["RBAC - Groups"] },
      })
      .delete("/:id", ({ params: { id } }) => GroupService.remove(id), {
        params: GroupModel.params,
        detail: { summary: "Delete group", tags: ["RBAC - Groups"] },
      })
  );
