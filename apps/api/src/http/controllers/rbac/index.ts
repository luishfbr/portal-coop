import { Elysia } from "elysia";
import { groupsController } from "./groups";
import { modulesController } from "./modules";
import { permissionsController } from "./permissions";
import { groupPermissionsController } from "./group-permissions";
import { userGroupsController } from "./user-groups";

export const rbacController = new Elysia({ prefix: "/api/v1/rbac" })
  .use(groupsController)
  .use(modulesController)
  .use(permissionsController)
  .use(groupPermissionsController)
  .use(userGroupsController);
