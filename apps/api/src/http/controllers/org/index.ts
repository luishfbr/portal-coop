import { Elysia } from "elysia";
import { agenciesController } from "./agencies";
import { sectorsController } from "./sectors";
import { jobFunctionsController } from "./job-functions";
import { userProfilesController } from "./user-profiles";

export const orgController = new Elysia({ name: "org" })
  .use(agenciesController)
  .use(sectorsController)
  .use(jobFunctionsController)
  .use(userProfilesController);
