# Portal Coop — API

Backend da aplicação Portal Coop. API REST construída com ElysiaJS + Bun, PostgreSQL via Drizzle ORM e autenticação gerenciada pelo Better Auth.

## Stack

| Tecnologia | Versão | Função |
|---|---|---|
| **Bun** | latest | Runtime + package manager |
| **ElysiaJS** | latest | Framework HTTP |
| **Drizzle ORM** | ^0.45 | ORM + query builder |
| **drizzle-zod** | ^0.8 | Geração de schemas Zod a partir das tabelas Drizzle |
| **Zod** | ^4 | Validação de schemas |
| **Better Auth** | ^1.6 | Autenticação (email/senha, 2FA, admin, OpenAPI) |
| **PostgreSQL (Neon)** | — | Banco de dados |
| **@elysiajs/cors** | ^1.4 | CORS |
| **@elysiajs/openapi** | ^1.4 | Documentação OpenAPI automática |
| **Nodemailer** | ^8 | Envio de e-mails (SMTP Mailtrap) |

## Estrutura de diretórios

```
src/  
├── index.ts                          # Entry point — monta a app Elysia
├── lib/
│   ├── auth.ts                       # Configuração do Better Auth
│   ├── env.ts                        # Validação de variáveis de ambiente (Zod)
│   ├── emails-template.ts            # Funções de envio de e-mail
│   └── transporter.ts                # Configuração Nodemailer (SMTP)
├── db/
│   ├── client.ts                     # Instância do Drizzle (db)
│   ├── seed.ts                       # Seed: cria usuário admin inicial
│   └── schema/
│       ├── index.ts                  # Re-exporta tabelas + exporta schema combinado
│       ├── auth-schema.ts            # Tabelas do Better Auth (users, sessions, etc.)
│       └── rbac-schema.ts            # Tabelas de RBAC (groups, modules, permissions, etc.)
└── http/
    ├── plugins/
    │   └── better-auth.ts            # Plugin Elysia com macros auth e adminOnly
    └── controllers/
        └── <feature>/                # Uma pasta por feature
            ├── index.ts              # Controller: instância Elysia com rotas
            ├── model.ts              # Schemas Zod via drizzle-zod + tipos exportados
            ├── service.ts            # Lógica de negócio (abstract class, métodos static)
            └── <sub-feature>/        # Sub-recursos seguem o mesmo padrão recursivamente
```

## Convenções de feature

Cada nova feature segue obrigatoriamente o padrão **MVC por domínio**:

```
src/http/controllers/<feature>/
├── model.ts
├── service.ts
└── index.ts
```

Registrar o controller no plugin pai correspondente (ou em `src/index.ts` se for top-level).

### Prefixos de rota

Todas as rotas de negócio seguem o padrão:

```
/api/v1/<feature>
```

As rotas do Better Auth ficam em `/auth/*` (montadas automaticamente).

---

## Schema (Drizzle)

### Localização
- `src/db/schema/auth-schema.ts` — tabelas gerenciadas pelo Better Auth (não editar manualmente)
- `src/db/schema/rbac-schema.ts` — tabelas de RBAC customizadas
- Novas tabelas de negócio → criar um novo arquivo `src/db/schema/<feature>-schema.ts` e registrar em `index.ts`

### Padrões obrigatórios para toda tabela

```typescript
import { randomUUIDv7 } from "bun";

export const minhaTabela = pgTable("minha_tabela", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUIDv7()),       // sempre gerar UUID no app

  // ... campos da tabela

  createdAt: timestamp("created_at")
    .notNull()
    .$defaultFn(() => new Date()),           // sempre $defaultFn, nunca .defaultNow()

  updatedAt: timestamp("updated_at")
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),            // atualiza automaticamente no .update()
});
```

### Tabelas de junção (N:N)

```typescript
export const minhaJuncao = pgTable(
  "minha_juncao",
  {
    id: text("id").primaryKey().$defaultFn(() => randomUUIDv7()),
    aId: text("a_id").notNull().references(() => tabelaA.id, { onDelete: "cascade" }),
    bId: text("b_id").notNull().references(() => tabelaB.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().$defaultFn(() => new Date()),
    // SEM updatedAt — join tables são imutáveis (apenas insert/delete)
  },
  (table) => [
    uniqueIndex("uq_minha_juncao").on(table.aId, table.bId), // evita duplicatas
  ]
);
```

### Registrar no `schema/index.ts`

Sempre re-exportar as tabelas e adicionar ao objeto `schema`:

```typescript
export * from "./<feature>-schema";

export const schema = {
  // ... existentes
  minhaTabela,
  minhaJuncao,
};
```

---

## Model (`model.ts`)

Usar `drizzle-zod` para gerar schemas a partir das tabelas. **Nunca declarar campos manualmente** se a tabela já existe no Drizzle.

```typescript
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { minhaTabela } from "@/db/schema";

// Gerar schemas base — sobrescrever validações específicas no segundo argumento
const _insert = createInsertSchema(minhaTabela, {
  nome: z.string().min(2).max(100),
});

const _update = createUpdateSchema(minhaTabela, {
  nome: z.string().min(2).max(100),
});

const _select = createSelectSchema(minhaTabela);

export const MinhaModel = {
  // Omitir campos com $defaultFn — são gerados internamente
  create: _insert.omit({ id: true, createdAt: true, updatedAt: true }),
  update: _update.omit({ id: true, createdAt: true, updatedAt: true }),
  response: _select,
  params: z.object({ id: z.string() }),
};

// Tipos derivados do schema — single source of truth
export type CreateMinha   = z.infer<typeof MinhaModel.create>;
export type UpdateMinha   = z.infer<typeof MinhaModel.update>;
export type MinhaResponse = z.infer<typeof MinhaModel.response>;
```

**Regras:**
- Sempre variável intermediária antes de `.omit()` / `.partial()` — evita erro de inferência circular
- Tipos exportados via `z.infer<>` — nunca declarar interface/type separado
- `createUpdateSchema` já torna todos os campos opcionais — ideal para PUT/PATCH

---

## Service (`service.ts`)

```typescript
import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { minhaTabela } from "@/db/schema";
import type { CreateMinha, UpdateMinha } from "./model";

export abstract class MinhaService {
  // ✅ abstract class + static — sem instância
  static findAll() {
    return db.query.minhaTabela.findMany({
      with: { relacao: true },
    });
  }

  static async findById(id: string) {
    const item = await db.query.minhaTabela.findFirst({
      where: eq(minhaTabela.id, id),
      with: { relacao: true },
    });

    // ✅ return status() — nunca throw
    if (!item) return status(404, "Item not found");
    return item;
  }

  static async create(data: CreateMinha) {
    const [item] = await db.insert(minhaTabela).values(data).returning();
    return item;
  }

  static async update(id: string, data: UpdateMinha) {
    const exists = await db.query.minhaTabela.findFirst({
      where: eq(minhaTabela.id, id),
      columns: { id: true },          // busca apenas id — mais eficiente
    });
    if (!exists) return status(404, "Item not found");

    const [updated] = await db
      .update(minhaTabela)
      .set(data)
      .where(eq(minhaTabela.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string) {
    const exists = await db.query.minhaTabela.findFirst({
      where: eq(minhaTabela.id, id),
      columns: { id: true },
    });
    if (!exists) return status(404, "Item not found");

    await db.delete(minhaTabela).where(eq(minhaTabela.id, id));
    return { deleted: true };
  }
}
```

**Regras:**
- `abstract class` com métodos `static` — nunca instanciar
- `return status(code, message)` para erros — importar de `"elysia"`
- Nunca receber `Context` do Elysia como parâmetro — apenas tipos derivados dos models
- Verificar existência antes de update/delete com `columns: { id: true }` (busca mínima)

---

## Controller (`index.ts`)

```typescript
import { Elysia } from "elysia";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { MinhaService } from "./service";
import { MinhaModel } from "./model";

export const minhaController = new Elysia({
  name: "minha-feature",      // ✅ sempre nomear para deduplicação
  prefix: "/minha-feature",
})
  .use(betterAuthPlugin)      // ✅ declarar dependência explicitamente
  .onError(({ code, error, status }) => {
    if (code === "VALIDATION") return status(422, { message: error.message });
  })

  // ── Rotas públicas ────────────────────────────────────────────────────────
  .get("/", () => MinhaService.findAll(), {
    detail: { summary: "List all", tags: ["Minha Feature"] },
  })
  .get("/:id", ({ params: { id } }) => MinhaService.findById(id), {
    params: MinhaModel.params,
    detail: { summary: "Get by id", tags: ["Minha Feature"] },
  })

  // ── Rotas protegidas — usar .guard() para agrupar ─────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .post("/", ({ body }) => MinhaService.create(body), {
        body: MinhaModel.create,
        detail: { summary: "Create", tags: ["Minha Feature"] },
      })
      .put("/:id", ({ params: { id }, body }) => MinhaService.update(id, body), {
        params: MinhaModel.params,
        body: MinhaModel.update,
        detail: { summary: "Update", tags: ["Minha Feature"] },
      })
      .delete("/:id", ({ params: { id } }) => MinhaService.remove(id), {
        params: MinhaModel.params,
        detail: { summary: "Delete", tags: ["Minha Feature"] },
      })
  );
```

**Regras:**
- Sempre `name` único no construtor — formato `"<dominio>.<recurso>"` (ex: `"rbac.groups"`)
- Sempre `.use(betterAuthPlugin)` — dependência explícita, nunca global
- Rotas públicas antes das protegidas
- Rotas com segmento literal antes de rotas parametrizadas (ex: `/by-module/:id` antes de `/:id`)
- `detail.tags` agrupam rotas no OpenAPI — usar o padrão `"Domínio - Recurso"`
- Inline handlers — nunca passar `Context` para o service

---

## Autenticação e Autorização

Definidos em `src/http/plugins/better-auth.ts` como macros do Elysia.

### Macros disponíveis

| Macro | Descrição | Injeta no contexto |
|---|---|---|
| `auth: true` | Requer sessão ativa | `user`, `session` |
| `adminOnly: true` | Requer sessão + `role === "admin"` | `user`, `session` |

### Uso por rota

```typescript
// Rota individual
.get("/perfil", ({ user }) => user, { auth: true })

// Bloco de rotas — preferir .guard()
.guard({ adminOnly: true }, (app) =>
  app
    .post("/", ...)
    .delete("/:id", ...)
)
```

### Adicionar novo nível de acesso

Adicionar um novo macro em `src/http/plugins/better-auth.ts`:

```typescript
.macro({
  // macro existente...
  auth: { ... },
  adminOnly: { ... },

  // novo nível:
  minhaRole: {
    async resolve({ status, request: { headers } }) {
      const session = await auth.api.getSession({ headers });
      if (!session) return status(401, "Unauthorized");
      if (session.user.role !== "minha-role") return status(403, "Forbidden");
      return { user: session.user, session: session.session };
    },
  },
})
```

---

## Registrar nova feature no servidor

### 1. Criar o plugin raiz da feature (se for um domínio novo)

```typescript
// src/http/controllers/<dominio>/index.ts
import { Elysia } from "elysia";
import { recursoAController } from "./recurso-a";
import { recursoBController } from "./recurso-b";

export const dominioController = new Elysia({ prefix: "/api/v1/<dominio>" })
  .use(recursoAController)
  .use(recursoBController);
```

### 2. Registrar em `src/index.ts`

```typescript
import { dominioController } from "./http/controllers/<dominio>";

const app = new Elysia()
  // ...plugins existentes
  .use(rbacController)
  .use(dominioController)   // ← adicionar aqui
  .listen(env.PORT);
```

---

## Variáveis de ambiente

Definidas e validadas em `src/lib/env.ts` com Zod. Toda nova variável deve ser adicionada ao schema antes de usar.

```typescript
// src/lib/env.ts
const envSchema = z.object({
  PORT: z.string().transform((e) => Number(e)),
  NODE_ENV: z.string().trim().min(1),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  SMTP_HOST: z.string().trim().min(1),
  SMTP_PORT: z.string().transform((e) => Number(e)),
  SMTP_USER: z.string().trim().min(1),
  SMTP_PASS: z.string().trim().min(1),
  SMTP_MAIL_FROM: z.email(),
  ADMIN_NAME: z.string().trim().min(1),
  ADMIN_EMAIL: z.string().trim().min(1),
  ADMIN_PASSWORD: z.string().trim().min(1),
  VITE_URL: z.url(),
});
```

Usar via `import { env } from "@/lib/env"` — nunca `process.env` diretamente.

---

## Scripts

```bash
bun run dev          # servidor com watch mode
bun run db:generate  # gera migration após mudança no schema
bun run db:migrate   # aplica migrations pendentes
bun run db:seed      # cria usuário admin (ADMIN_* do .env)
bun run auth:generate # regenera auth-schema.ts a partir do Better Auth
```

---

## Alias de paths

`@/*` → `./src/*` (configurado em `tsconfig.json`)

```typescript
import { db } from "@/db/client";
import { env } from "@/lib/env";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
```

---

## Regras gerais

- **Nunca usar `process.env`** — sempre `env` de `@/lib/env`
- **Nunca usar `throw`** em services — usar `return status(code, message)`
- **Nunca instanciar services** — sempre `abstract class` com métodos `static`
- **Nunca passar `Context` do Elysia para services** — extrair apenas os dados necessários inline
- **Nunca declarar tipos separados dos schemas** — usar `z.infer<typeof Model.campo>`
- **Sempre nomear plugins Elysia** — `new Elysia({ name: "..." })` para deduplicação
- **Sempre usar `columns: { id: true }`** em verificações de existência antes de update/delete
- **Nomes de tabelas SQL sem hífen** — usar underscore (`user_groups`, não `user-groups`)
