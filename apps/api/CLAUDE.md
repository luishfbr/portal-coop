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
| **Better Auth** | ^1.6 | Autenticação (email/senha, 2FA TOTP, admin, OpenAPI) |
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
│   ├── seed.ts                       # Seed: admin inicial + módulos iniciais
│   └── schema/
│       ├── index.ts                  # Importa tabelas + exporta schema combinado
│       ├── auth-schema.ts            # Tabelas do Better Auth (não editar manualmente)
│       ├── modules-schema.ts         # Tabela de módulos do sistema
│       ├── organizational-schema.ts  # Agências, setores, áreas, funções, perfis de usuário
│       └── <feature>-schema.ts       # Uma por feature de negócio
└── http/
    ├── plugins/
    │   └── better-auth.ts            # Plugin Elysia com macros auth e adminOnly
    └── controllers/
        ├── modules/                  # Módulos do sistema (ativação/inativação)
        │   ├── index.ts
        │   ├── model.ts
        │   └── service.ts
        ├── org/                      # Domínio organizacional
        │   ├── index.ts              # Root controller — agrega sub-controllers do domínio
        │   ├── agencies/             # Agências/Unidades/PAs
        │   │   ├── index.ts
        │   │   ├── model.ts
        │   │   └── service.ts
        │   ├── sectors/              # Setores
        │   │   ├── index.ts
        │   │   ├── model.ts
        │   │   ├── service.ts
        │   │   └── areas/            # Áreas (sub-recurso de setor)
        │   │       ├── index.ts
        │   │       ├── model.ts
        │   │       └── service.ts
        │   ├── job-functions/        # Funções
        │   │   ├── index.ts
        │   │   ├── model.ts
        │   │   └── service.ts
        │   └── user-profiles/        # Vínculos organizacionais do usuário
        │       ├── index.ts
        │       ├── model.ts
        │       └── service.ts
        └── <feature>/                # Uma pasta por feature
            ├── index.ts              # Controller: instância Elysia com rotas
            ├── model.ts              # Schemas Zod via drizzle-zod + tipos exportados
            ├── service.ts            # Lógica de negócio (abstract class, métodos static)
            └── <sub-feature>/        # Sub-recursos seguem o mesmo padrão recursivamente
```

## Rotas da API

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| `GET` | `/health` | público | Health check — retorna `{ status, uptime }` |
| `*` | `/auth/*` | — | Rotas do Better Auth (login, 2FA, reset, admin) |
| `GET` | `/api/v1/modules/active` | `auth` | Lista módulos ativos (para sidebar) |
| `GET` | `/api/v1/modules` | `adminOnly` | Lista todos os módulos (ativos e inativos) |
| `PATCH` | `/api/v1/modules/:id/toggle` | `adminOnly` | Alterna `isActive` do módulo |
| `GET` | `/api/v1/agencies` | `adminOnly` | Lista agências |
| `POST` | `/api/v1/agencies` | `adminOnly` | Cria agência |
| `PATCH` | `/api/v1/agencies/:id` | `adminOnly` | Atualiza agência |
| `PATCH` | `/api/v1/agencies/:id/toggle` | `adminOnly` | Alterna `isActive` da agência |
| `DELETE` | `/api/v1/agencies/:id` | `adminOnly` | Remove agência |
| `GET` | `/api/v1/sectors` | `adminOnly` | Lista setores (com áreas) |
| `POST` | `/api/v1/sectors` | `adminOnly` | Cria setor |
| `PATCH` | `/api/v1/sectors/:id` | `adminOnly` | Atualiza setor |
| `PATCH` | `/api/v1/sectors/:id/toggle` | `adminOnly` | Alterna `isActive` do setor |
| `DELETE` | `/api/v1/sectors/:id` | `adminOnly` | Remove setor (áreas deletadas em cascade) |
| `GET` | `/api/v1/sectors/:sectorId/areas` | `adminOnly` | Lista áreas de um setor |
| `POST` | `/api/v1/sectors/:sectorId/areas` | `adminOnly` | Cria área no setor |
| `PATCH` | `/api/v1/sectors/:sectorId/areas/:id` | `adminOnly` | Atualiza área |
| `PATCH` | `/api/v1/sectors/:sectorId/areas/:id/toggle` | `adminOnly` | Alterna `isActive` da área |
| `DELETE` | `/api/v1/sectors/:sectorId/areas/:id` | `adminOnly` | Remove área |
| `GET` | `/api/v1/job-functions` | `adminOnly` | Lista funções |
| `POST` | `/api/v1/job-functions` | `adminOnly` | Cria função |
| `PATCH` | `/api/v1/job-functions/:id` | `adminOnly` | Atualiza função |
| `PATCH` | `/api/v1/job-functions/:id/toggle` | `adminOnly` | Alterna `isActive` da função |
| `DELETE` | `/api/v1/job-functions/:id` | `adminOnly` | Remove função |
| `GET` | `/api/v1/users/:userId/org-profile` | `adminOnly` | Lê perfil organizacional do usuário |
| `PUT` | `/api/v1/users/:userId/org-profile` | `adminOnly` | Define/atualiza vínculos organizacionais do usuário |

> Ao adicionar novas features, registrar as rotas nesta tabela.

---

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

## Autenticação e Autorização

### Plugins Better Auth ativos

| Plugin | Configuração relevante |
|---|---|
| `emailAndPassword` | habilitado, hash via `Bun.password`, min 8 / max 32 chars, reset de senha em 30 min |
| `twoFactor` | **somente TOTP** (aplicativo autenticador), backup codes criptografados, cookie 2FA expira em 10 min |
| `admin` | gerenciamento de usuários pelo painel admin |
| `openAPI` | documentação gerada automaticamente em `/auth/reference` |

### Configurações de sessão

- Expiração: **7 dias** (`expiresIn: 60 * 60 * 24 * 7`)
- Renovação automática: a cada 24h de uso (`updateAge`)
- Cookie cache: 5 min, estratégia `"compact"`
- Cookies seguros: habilitado automaticamente em `NODE_ENV=production`

### Rate limiting (storage: database)

| Endpoint | Janela | Máximo |
|---|---|---|
| `/sign-in/email` | 60s | 5 tentativas |
| `/sign-up/email` | 60s | 3 tentativas |
| `/forget-password` | 60s | 3 tentativas |

### Macros disponíveis

Definidos em `src/http/plugins/better-auth.ts`:

| Macro | Quem pode chamar | Injeta no contexto |
|---|---|---|
| `auth: true` | Qualquer usuário autenticado | `user`, `session` |
| `adminOnly: true` | Usuários com `role === "admin"` | `user`, `session` |

### Uso das macros

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
  auth: { ... },       // já existe
  adminOnly: { ... },  // já existe

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

## Schema (Drizzle)

### Localização

- `src/db/schema/auth-schema.ts` — tabelas gerenciadas pelo Better Auth (**não editar manualmente**)
- `src/db/schema/modules-schema.ts` — tabela de módulos do sistema
- `src/db/schema/<feature>-schema.ts` — tabelas de negócio (uma por feature)
- `src/db/schema/index.ts` — registra todas as tabelas no objeto `schema`

### Tabelas do Better Auth (`auth-schema.ts`)

Geradas por `bun run auth:generate`. Não editar. Tabelas atuais:

| Tabela | Propósito |
|---|---|
| `users` | Usuários (+ campos `role`, `banned`, `twoFactorEnabled`) |
| `sessions` | Sessões ativas |
| `accounts` | Provedores de conta (email/senha, OAuth) |
| `verifications` | Tokens de verificação (reset de senha) |
| `twoFactors` | Segredos TOTP e backup codes |
| `rateLimits` | Contadores de rate limiting |

**Após rodar `bun run auth:generate`:** verificar se novas tabelas foram adicionadas e incluí-las manualmente no `schema/index.ts`.

### Tabelas de negócio

| Tabela | Arquivo | Propósito |
|---|---|---|
| `modules` | `modules-schema.ts` | Módulos do sistema (ativação/inativação por admins) |
| `agencies` | `organizational-schema.ts` | Agências/Unidades/PAs |
| `sectors` | `organizational-schema.ts` | Setores |
| `areas` | `organizational-schema.ts` | Subdivisões de setores (FK → sectors, CASCADE delete) |
| `job_functions` | `organizational-schema.ts` | Funções/cargos |
| `user_profiles` | `organizational-schema.ts` | Vínculos organizacionais do usuário (1:1 com users) |

#### `modules`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `text` PK | UUID v7 gerado em app |
| `name` | `text` | Nome exibível do módulo |
| `description` | `text` | Descrição do módulo |
| `slug` | `text` UNIQUE | Chave de rota (ex: `dashboards-internos`) |
| `icon` | `text` | Nome do ícone lucide-react (ex: `LayoutDashboard`) |
| `is_active` | `boolean` | Visibilidade do módulo — padrão `true` |
| `created_at` | `timestamp` | Gerado em app via `$defaultFn` |
| `updated_at` | `timestamp` | Atualizado via `$onUpdate` |

> Módulos são injetados via seed pelos desenvolvedores. Admins só podem alternar `isActive`.

#### Catálogos organizacionais (`agencies`, `sectors`, `job_functions`)

Todas seguem a mesma estrutura:

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `text` PK | UUID v7 gerado em app |
| `name` | `text` | Nome exibível |
| `description` | `text` nullable | Descrição opcional |
| `is_active` | `boolean` | Padrão `true` — alternável via `toggle` |
| `created_at` | `timestamp` | Gerado em app via `$defaultFn` |
| `updated_at` | `timestamp` | Atualizado via `$onUpdate` |

#### `areas`

Subdivisão de setor. Mesma estrutura dos catálogos acima, mais:

| Coluna | Tipo | Observação |
|---|---|---|
| `sector_id` | `text` FK | Referência ao setor pai — `onDelete: "cascade"` |

#### `user_profiles`

Vínculo 1:1 entre usuário e estrutura organizacional. Todas as FK são nullable — usuário pode existir sem vínculo.

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | `text` PK | UUID v7 gerado em app |
| `user_id` | `text` FK UNIQUE | Referência ao usuário — `onDelete: "cascade"` |
| `agency_id` | `text` FK nullable | `onDelete: "set null"` |
| `sector_id` | `text` FK nullable | `onDelete: "set null"` |
| `area_id` | `text` FK nullable | `onDelete: "set null"` — deve pertencer ao `sector_id` informado |
| `job_function_id` | `text` FK nullable | `onDelete: "set null"` |
| `created_at` | `timestamp` | Gerado em app via `$defaultFn` |
| `updated_at` | `timestamp` | Atualizado via `$onUpdate` |

> Regra de negócio: se `areaId` for informado no `PUT /api/v1/users/:userId/org-profile`, o service valida que a área pertence ao `sectorId` informado. Retorna `400` se inconsistente.

### Padrões obrigatórios para toda tabela de negócio

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
import { minhaTabela } from "./<feature>-schema";

export const schema = {
  // ... existentes
  minhaTabela,
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
  errorResponse: z.object({ message: z.string() }),
  deletedResponse: z.object({ deleted: z.boolean() }),
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

    // ✅ return status() com objeto — nunca string pura, nunca throw
    if (!item) return status(404, { message: "Item not found" });
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
    if (!exists) return status(404, { message: "Item not found" });

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
    if (!exists) return status(404, { message: "Item not found" });

    await db.delete(minhaTabela).where(eq(minhaTabela.id, id));
    return { deleted: true };
  }
}
```

**Regras:**
- `abstract class` com métodos `static` — nunca instanciar
- `return status(code, message)` para erros — importar de `"elysia"`
- Nunca receber `Context` do Elysia como parâmetro — extrair apenas os dados necessários inline
- Verificar existência antes de update/delete com `columns: { id: true }` (busca mínima)
- Para inverter um booleano diretamente no banco: `.set({ campo: not(tabela.campo) })` da `drizzle-orm`

---

## Controller (`index.ts`)

```typescript
import { Elysia } from "elysia";
import { z } from "zod";
import { betterAuthPlugin } from "@/http/plugins/better-auth";
import { MinhaService } from "./service";
import { MinhaModel } from "./model";

export const minhaController = new Elysia({
  name: "minha-feature",      // ✅ sempre nomear para deduplicação
  prefix: "/api/v1/minha-feature",
})
  .use(betterAuthPlugin)      // ✅ declarar dependência explicitamente
  // ── Rotas com acesso individual (auth ou público) ─────────────────────────
  .get("/active", () => MinhaService.findActive(), {
    auth: true,
    detail: { summary: "List active", tags: ["Minha Feature"] },
    response: {
      200: z.array(MinhaModel.response),
      401: MinhaModel.errorResponse,
    },
  })

  // ── Rotas protegidas — usar .guard() para agrupar ─────────────────────────
  .guard({ adminOnly: true }, (app) =>
    app
      .get("/", () => MinhaService.findAll(), {
        detail: { summary: "List all", tags: ["Minha Feature"] },
        response: {
          200: z.array(MinhaModel.response),
          401: MinhaModel.errorResponse,
          403: MinhaModel.errorResponse,
        },
      })
      .post("/", ({ body }) => MinhaService.create(body), {
        body: MinhaModel.create,
        detail: { summary: "Create", tags: ["Minha Feature"] },
        response: {
          200: MinhaModel.response,
          401: MinhaModel.errorResponse,
          403: MinhaModel.errorResponse,
          422: MinhaModel.errorResponse,
        },
      })
      .patch("/:id/toggle", ({ params: { id } }) => MinhaService.toggle(id), {
        params: MinhaModel.params,
        detail: { summary: "Toggle status", tags: ["Minha Feature"] },
        response: {
          200: MinhaModel.response,
          401: MinhaModel.errorResponse,
          403: MinhaModel.errorResponse,
          404: MinhaModel.errorResponse,
        },
      })
      .delete("/:id", ({ params: { id } }) => MinhaService.remove(id), {
        params: MinhaModel.params,
        detail: { summary: "Delete", tags: ["Minha Feature"] },
        response: {
          200: MinhaModel.deletedResponse,
          401: MinhaModel.errorResponse,
          403: MinhaModel.errorResponse,
          404: MinhaModel.errorResponse,
        },
      })
  );
```

**Regras:**
- Sempre `name` único no construtor (ex: `"modules"`, `"goals"`, `"goals.entries"`)
- Sempre `.use(betterAuthPlugin)` — dependência explícita, nunca global
- **Nunca adicionar `.onError()` nos controllers** — o root `src/index.ts` já trata `VALIDATION → 422`, `NOT_FOUND → 404` e `500`
- Sempre adicionar campo `response` em cada rota com todos os status codes possíveis (200, 401, 403, 404, 422 conforme aplicável) — documentação OpenAPI automática
- Rotas com macro individual (`auth: true`) antes do `.guard()` adminOnly
- Rotas com segmento literal antes de rotas parametrizadas (ex: `/active` antes de `/:id`)
- `detail.tags` agrupam rotas no OpenAPI
- Inline handlers — nunca passar `Context` para o service

---

## Seed (`src/db/seed.ts`)

O seed é idempotente — pode ser re-executado sem duplicar dados.

**O que é seedado:**

1. **Usuário admin** — lido de `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` no `.env`. Cria via `auth.api.signUpEmail()` e eleva `role` para `"admin"`. Verifica existência antes de criar.

2. **Módulos do sistema** — inseridos com `onConflictDoNothing({ target: modules.slug })`. Adicionar novos módulos ao array `initialModules` no seed e re-executar.

**Para adicionar um novo módulo ao sistema:**

```typescript
// Em src/db/seed.ts — adicionar ao array initialModules:
{
  name: "Nome do Módulo",
  description: "Descrição do módulo",
  slug: "slug-do-modulo",          // deve bater com a URL da rota no frontend
  icon: "NomeDoIconeLucide",        // string — mapeada para componente no frontend
},
```

Após editar, rodar `bun run db:seed`.

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
  .onError(...)
  .get("/health", ...)
  .use(cors(...))
  .use(openapi(...))
  .use(betterAuthPlugin)
  .use(modulesController)     // já existe
  .use(dominioController)     // ← adicionar aqui
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
  BETTER_AUTH_SECRET: z.string().min(32),  // mínimo 32 chars — gerar com: openssl rand -base64 32
  BETTER_AUTH_URL: z.url(),                // URL base da API (ex: http://localhost:8080)
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
bun run dev           # servidor com watch mode
bun run db:generate   # gera migration após mudança no schema
bun run db:migrate    # aplica migrations pendentes
bun run db:seed       # cria admin + insere módulos iniciais
bun run auth:generate # regenera auth-schema.ts a partir do Better Auth
                      # ⚠️ após rodar: verificar se novas tabelas precisam ser adicionadas ao schema/index.ts
bun run test          # roda todos os testes
bun run test:watch    # modo watch
bun run test:cov      # com cobertura
```

---

## Testes

Runner: **`bun:test`** (nativo, sem config extra). Alias `@/*` resolvido automaticamente pelo Bun.

### Estrutura de arquivos

```
src/
├── tests/
│   └── helpers/
│       ├── fixtures.ts     # fábricas de objetos para todos os domínios
│       └── mock-auth.ts    # valores de env mockados (referência)
└── http/controllers/
    ├── modules/
    │   ├── service.test.ts
    │   └── index.test.ts
    └── org/
        ├── agencies/
        │   ├── service.test.ts
        │   └── index.test.ts
        ├── sectors/
        │   ├── service.test.ts
        │   ├── index.test.ts
        │   └── areas/
        │       ├── service.test.ts
        │       └── index.test.ts
        ├── job-functions/
        │   ├── service.test.ts
        │   └── index.test.ts
        └── user-profiles/
            ├── service.test.ts
            └── index.test.ts
```

Cada feature tem dois arquivos de teste co-localizados com o código: `service.test.ts` e `index.test.ts`.

### Padrão: Service test

Mockar `@/db/client` no topo do arquivo com `mock.module()` (hoistado antes dos imports). Declarar as funções mock fora da factory para poder usar `mockResolvedValueOnce` por teste.

```typescript
import { describe, test, expect, mock } from "bun:test";

const findMany = mock(() => Promise.resolve([]));
const findFirst = mock(() => Promise.resolve(null));
const insertReturning = mock(() => Promise.resolve([]));
const updateReturning = mock(() => Promise.resolve([]));

mock.module("@/db/client", () => ({
  db: {
    query: {
      minhaTabela: { findMany, findFirst },
    },
    insert: mock(() => ({ values: mock(() => ({ returning: insertReturning })) })),
    update: mock(() => ({ set: mock(() => ({ where: mock(() => ({ returning: updateReturning })) })) })),
    delete: mock(() => ({ where: mock(() => Promise.resolve()) })),
  },
}));

import { MinhaService } from "./service";
import { makeItem } from "@/tests/helpers/fixtures";

describe("MinhaService", () => {
  test("returns 404 when item not found", async () => {
    findFirst.mockResolvedValueOnce(null);
    const result = await MinhaService.findById("bad-id");
    expect(result).toMatchObject({ code: 404, response: "Item not found" });
  });

  test("returns item when found", async () => {
    const item = makeItem();
    findFirst.mockResolvedValueOnce(item);
    expect(await MinhaService.findById("item-1")).toEqual(item);
  });
});
```

**Regras:**
- `mock.module()` deve vir **antes** do `import` do service — é hoistado automaticamente
- Usar `mockResolvedValueOnce` por teste — nunca `mockResolvedValue` persistente (vaza entre testes)
- Nunca usar `beforeEach(() => mock.mockReset())` — interage mal com `mockResolvedValueOnce` no bun:test
- Erros do service retornam `{ code: N, response: "..." }` — usar `toMatchObject({ code: 404, response: "..." })` para assertar

### Padrão: Controller test

Mockar `@/lib/auth` e `@/lib/env` antes dos imports. Usar `spyOn` para isolar o service.

```typescript
import { describe, test, expect, mock, spyOn, afterEach } from "bun:test";

const mockGetSession = mock(() => Promise.resolve(null));

mock.module("@/lib/auth", () => ({
  auth: {
    handler: async () => new Response("ok"),
    api: {
      getSession: mockGetSession,
      generateOpenAPISchema: mock(() => Promise.resolve({ paths: {}, components: {} })),
    },
  },
}));

mock.module("@/lib/env", () => ({
  env: {
    PORT: 8080, NODE_ENV: "test",
    DATABASE_URL: "postgresql://test:test@localhost/test",
    BETTER_AUTH_SECRET: "a".repeat(32), BETTER_AUTH_URL: "http://localhost:8080",
    SMTP_HOST: "localhost", SMTP_PORT: 587, SMTP_USER: "u",
    SMTP_PASS: "p", SMTP_MAIL_FROM: "test@example.com",
    ADMIN_NAME: "Admin", ADMIN_EMAIL: "admin@example.com",
    ADMIN_PASSWORD: "password123", VITE_URL: "http://localhost:3000",
  },
}));

afterEach(() => mock.restore()); // limpa spyOn entre testes

import { minhaController } from "./index";
import { MinhaService } from "./service";
import { makeItem, makeAdminSession, makeSession } from "@/tests/helpers/fixtures";

const ADMIN = makeAdminSession();
const USER  = makeSession({ role: "user" });

function req(method: string, path: string, body?: unknown) {
  return minhaController.handle(
    new Request(`http://localhost${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  );
}

describe("MinhaController", () => {
  test("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValueOnce(null);
    expect((await req("GET", "/api/v1/minha-feature")).status).toBe(401);
  });

  test("returns 403 when non-admin", async () => {
    mockGetSession.mockResolvedValueOnce(USER);
    expect((await req("GET", "/api/v1/minha-feature")).status).toBe(403);
  });

  test("returns 200 with items", async () => {
    mockGetSession.mockResolvedValueOnce(ADMIN);
    spyOn(MinhaService, "findAll").mockResolvedValue([makeItem()]);
    expect((await req("GET", "/api/v1/minha-feature")).status).toBe(200);
  });

  test("proxies 404 from service", async () => {
    mockGetSession.mockResolvedValueOnce(ADMIN);
    const { status } = await import("elysia");
    spyOn(MinhaService, "findById").mockResolvedValue(status(404, "Item not found") as never);
    expect((await req("GET", "/api/v1/minha-feature/bad-id")).status).toBe(404);
  });
});
```

**Regras:**
- Mockar `@/lib/auth` (não o `betterAuthPlugin` diretamente) — o plugin usa `auth.api.getSession()` em runtime
- `afterEach(() => mock.restore())` — obrigatório para limpar `spyOn` entre testes
- Usar `.handle(new Request(...))` — não requer servidor HTTP rodando
- Body inválido (validação Zod) retorna `422` — o controller usa `.onError` para converter `VALIDATION` errors
- `status` importado de `"elysia"` para simular retorno de erro do service nos `spyOn`

### Fixtures (`src/tests/helpers/fixtures.ts`)

Exporta fábricas para todos os domínios: `makeModule`, `makeAgency`, `makeSector`, `makeArea`, `makeJobFunction`, `makeUserProfile`, `makeUser`, `makeSession`, `makeAdminSession`.

Todas aceitam `overrides` parciais:

```typescript
makeAgency({ name: "Agência Teste", isActive: false })
makeSession({ role: "admin" })  // ou usar makeAdminSession()
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
- **Nunca usar `throw`** em services — usar `return status(code, { message: "..." })`
- **Sempre usar objeto `{ message }` nos erros** — nunca string pura como segundo argumento do `status()`
- **Nunca instanciar services** — sempre `abstract class` com métodos `static`
- **Nunca passar `Context` do Elysia para services** — extrair apenas os dados necessários inline
- **Nunca declarar tipos separados dos schemas** — usar `z.infer<typeof Model.campo>`
- **Sempre nomear plugins Elysia** — `new Elysia({ name: "..." })` para deduplicação
- **Sempre usar `columns: { id: true }`** em verificações de existência antes de update/delete
- **Nomes de tabelas SQL sem hífen** — usar underscore (`user_groups`, não `user-groups`)
- **Nunca editar `auth-schema.ts` manualmente** — regenerar com `bun run auth:generate`
- **`users` não é re-exportado de `schema/index.ts`** — quando um service precisar da tabela `users`, importar diretamente: `import { users } from "@/db/schema/auth-schema"`
- **2FA é somente TOTP** — não configurar OTP por e-mail (plugin não está ativo)
- **Módulos não são criados/editados/excluídos por admins** — apenas seedados por devs e ativados/inativados via `toggle`
