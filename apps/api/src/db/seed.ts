import { env } from "@/lib/env";
import { db } from "./client";
import { and, eq, inArray } from "drizzle-orm";
import { users } from "./schema/auth-schema";
import { modules } from "./schema/modules-schema";
import { groups, permissions, groupPermissions } from "./schema/rbac-schema";
import { auth } from "@/lib/auth";

type PermissionSeed = {
  slug: string;
  name: string;
  description?: string;
};

type GroupSeed = {
  slug: string;
  name: string;
  description: string;
  permissions: string[]; // permission slugs from the parent module
};

type ModuleSeed = {
  name: string;
  description: string;
  slug: string;
  icon: string;
  permissions: PermissionSeed[];
  groups: GroupSeed[];
};

const initialModules: ModuleSeed[] = [];

async function main() {
  console.log("Seeding...");

  // ── Admin user ─────────────────────────────────────────────────────────────
  const admin = {
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
  };

  const verify = await db.query.users.findFirst({
    where: and(eq(users.role, "admin"), eq(users.email, admin.email)),
  });

  if (!verify) {
    const create = await auth.api.signUpEmail({ body: admin });

    if (!create.user) {
      console.log("Fail on create admin user.");
      return;
    }

    await db.update(users).set({ role: "admin" }).where(eq(users.id, create.user.id));
  }

  if (initialModules.length > 0) {
    // ── 1. Modules ───────────────────────────────────────────────────────────
    const moduleRows = initialModules.map(({ permissions: _p, groups: _g, ...m }) => m);
    await db.insert(modules).values(moduleRows).onConflictDoNothing({ target: modules.slug });

    const seededModules = await db.query.modules.findMany({
      where: inArray(modules.slug, initialModules.map((m) => m.slug)),
      columns: { id: true, slug: true },
    });

    // ── 2. Permissions ───────────────────────────────────────────────────────
    const permissionRows = initialModules.flatMap((m) => {
      const mod = seededModules.find((sm) => sm.slug === m.slug);
      if (!mod) return [];
      return m.permissions.map((p) => ({ ...p, moduleId: mod.id }));
    });

    if (permissionRows.length > 0) {
      await db.insert(permissions).values(permissionRows).onConflictDoNothing();
    }

    const allPermissionSlugs = initialModules.flatMap((m) =>
      m.permissions.map((p) => p.slug)
    );
    const seededPermissions = await db.query.permissions.findMany({
      where: inArray(permissions.slug, allPermissionSlugs),
      columns: { id: true, slug: true, moduleId: true },
    });

    // ── 3. Groups ────────────────────────────────────────────────────────────
    const groupRows = initialModules.flatMap((m) =>
      m.groups.map(({ permissions: _p, ...g }) => g)
    );

    if (groupRows.length > 0) {
      await db.insert(groups).values(groupRows).onConflictDoNothing({ target: groups.slug });
    }

    const allGroupSlugs = initialModules.flatMap((m) => m.groups.map((g) => g.slug));
    const seededGroups = await db.query.groups.findMany({
      where: inArray(groups.slug, allGroupSlugs),
      columns: { id: true, slug: true },
    });

    // ── 4. Group permissions ─────────────────────────────────────────────────
    const gpRows = initialModules.flatMap((m) => {
      const mod = seededModules.find((sm) => sm.slug === m.slug);
      if (!mod) return [];

      return m.groups.flatMap((gs) => {
        const group = seededGroups.find((sg) => sg.slug === gs.slug);
        if (!group) return [];

        return gs.permissions.flatMap((permSlug) => {
          const perm = seededPermissions.find(
            (sp) => sp.slug === permSlug && sp.moduleId === mod.id
          );
          if (!perm) return [];
          return [{ groupId: group.id, permissionId: perm.id }];
        });
      });
    });

    if (gpRows.length > 0) {
      await db.insert(groupPermissions).values(gpRows).onConflictDoNothing();
    }
  }

  console.log("Seed finished!");
}

main();
