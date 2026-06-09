import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { UserProfilesService } from "./service";
import { UserProfilesModel } from "./model";

export const userProfilesController = new Elysia({
  name: "org.user-profiles",
  prefix: "/api/v1/users",
})
  .use(betterAuthPlugin)
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/:userId/org-profile", ({ params: { userId } }) =>
        UserProfilesService.findByUser(userId), {
        params: UserProfilesModel.params,
        detail: {
          summary: "Get user org profile",
          description: "Retorna o perfil organizacional do usuário, ou null se ainda não foi definido.",
          tags: ["User Profiles"],
        },
        response: {
          200: UserProfilesModel.response.nullable(),
          401: UserProfilesModel.errorResponse,
          403: UserProfilesModel.errorResponse,
          404: UserProfilesModel.errorResponse,
        },
      })
      .put("/:userId/org-profile", ({ params: { userId }, body }) =>
        UserProfilesService.upsert(userId, body), {
        params: UserProfilesModel.params,
        body: UserProfilesModel.upsert,
        detail: {
          summary: "Set user org profile",
          description:
            "Cria ou atualiza os vínculos organizacionais do usuário. " +
            "Todas as FKs são validadas antes de persistir — retorna 422 se qualquer entidade referenciada não existir. " +
            "Se areaId for informado junto com sectorId, a área deve pertencer ao setor.",
          tags: ["User Profiles"],
        },
        response: {
          200: UserProfilesModel.response,
          401: UserProfilesModel.errorResponse,
          403: UserProfilesModel.errorResponse,
          404: UserProfilesModel.errorResponse,
          422: UserProfilesModel.errorResponse,
        },
      }),
  );
