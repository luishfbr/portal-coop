import { env } from "@/lib/env";
import { db } from "./client";
import { and, eq } from "drizzle-orm";
import { users } from "./schema/auth-schema";
import { auth } from "@/lib/auth";

async function main() {
  console.log("Seeding...");

  const admin = {
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  };

  const verify = await db.query.users.findFirst({
    where: and(eq(users.role, "admin"), eq(users.email, admin.email)),
  });

  if (!verify) {
    const create = await auth.api.signUpEmail({
      body: admin,
    });

    if (!create.user) {
      console.log("Fail on create admin user.");
      return;
    }

    const changeRole = await db
      .update(users)
      .set({
        role: "admin",
      })
      .where(eq(users.id, create.user.id));

    if (!changeRole) {
      console.log("Fail on set role admin.");
      return;
    }
  }

  console.log("Seed finished!");
}

main();
