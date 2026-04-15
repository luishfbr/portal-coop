# Portal Coop — Guia do Monorepo

Sistema de gestão cooperativa. Monorepo com uma API REST (`api/`) e um SPA React (`web/`) que se comunicam via HTTP.

```
portal-coop/
├── api/       # ElysiaJS + Bun, Drizzle ORM, PostgreSQL, Better Auth
├── web/       # React 19, TanStack Router, shadcn/ui, TanStack Query
└── CLAUDE.md  # Este arquivo (visão geral + padrões web)
               # api/CLAUDE.md tem todos os padrões específicos da API
```

| Serviço | URL |
|---|---|
| API | `http://localhost:8080` |
| Web | `http://localhost:3000` |

---

## Desenvolvimento

Ambos os serviços rodam simultaneamente em terminais separados.

```bash
# API (a partir de api/)
bun run dev            # modo watch — http://localhost:8080
bun run db:generate    # gera migração após mudança no schema
bun run db:migrate     # aplica migrações pendentes
bun run db:seed        # cria usuário admin inicial (lê ADMIN_* do .env)
bun run auth:generate  # regenera api/src/db/schema/auth-schema.ts

# Web (a partir de web/)
bun run dev            # servidor Vite — http://localhost:3000
bun run build          # build de produção
bun run typecheck      # tsc --noEmit
bun run lint           # ESLint
bun run format         # Prettier
```

---

## Autenticação e Autorização

### Fluxo de sessão

- Better Auth gerencia sessões via cookie `HttpOnly` definido pelo servidor
- O cliente web lê a sessão com `authClient.useSession()` dentro de `AuthProvider` (`web/src/auth.tsx`)
- `AuthContext` é injetado no contexto do TanStack Router em `main.tsx` e disponível em toda a aplicação via `useAuth()` ou `router.options.context.auth`
- **2FA é obrigatório.** O layout do dashboard (`web/src/routes/_dashboard/_pathlessLayout.tsx`) bloqueia o acesso se `!user` (exibe `UnauthorizedPage`) ou se `!user.twoFactorEnabled` (exibe `EnableTwoFactorPage`)

### Fluxo de login

```
login → se twoFactorRedirect → enviar OTP → /verificacao-2fa → /pagina-inicial
                             ↘ sem 2FA habilitado → /habilitar-2fa (obrigatório)
```

### Macros de autorização na API

Definidas em `api/src/http/plugins/better-auth.ts`:

| Macro | Quem pode chamar |
|---|---|
| `{ auth: true }` | Qualquer usuário autenticado |
| `{ adminOnly: true }` | Usuários com `role === "admin"` |

---

## Modelo RBAC

O sistema de permissões tem duas camadas:

**Camada 1 — Better Auth roles (grossa)**
- Campo `role` na tabela `users`: `"user"` (padrão) ou `"admin"`
- Aplicado via macro `adminOnly` na API
- Usar para: operações administrativas de gestão (criar/editar/deletar recursos)

**Camada 2 — RBAC customizado (fina, nível aplicação)**
- Tabelas: `groups`, `permissions`, `modules`, `group_permissions`, `user_groups`
- Um `module` representa uma área de feature (ex: "relatórios")
- Uma `permission` pertence a um `module` e tem um `slug` (ex: `view`, `export`)
- Um `group` é um conjunto de permissões (ex: "Analistas")
- Usuários são atribuídos a grupos; grupos têm permissões

```
users ──< user_groups >── groups ──< group_permissions >── permissions ──> modules
```

**Regra:** Nunca adicionar novos roles no Better Auth para controle fino — usar grupos RBAC.

---

## Checklist de Nova Feature

### Passo 1 — API: Schema do banco

- [ ] Criar `api/src/db/schema/<feature>-schema.ts` (ver padrões em `api/CLAUDE.md`)
- [ ] Exportar do `api/src/db/schema/index.ts`
- [ ] Rodar: `bun run db:generate && bun run db:migrate`

### Passo 2 — API: Model, Service e Controller

- [ ] Criar `api/src/http/controllers/<domínio>/<feature>/model.ts` (drizzle-zod)
- [ ] Criar `api/src/http/controllers/<domínio>/<feature>/service.ts` (classe abstrata, métodos estáticos, retornar `status()` — nunca lançar erros)
- [ ] Criar `api/src/http/controllers/<domínio>/<feature>/index.ts` (plugin Elysia nomeado)
- [ ] Ver todos os padrões detalhados em `api/CLAUDE.md`

### Passo 3 — API: Registrar controller

- [ ] Adicionar `.use(featureController)` no controller pai ou em `api/src/index.ts`

### Passo 4 — Web: Schemas Zod

- [ ] Adicionar schemas de formulário em `web/src/lib/validations.ts`
- [ ] Exportar tipos: `export type NovaType = z.infer<typeof novaSchema>`

### Passo 5 — Web: Hook TanStack Query

- [ ] Criar `web/src/hooks/use-<feature>.ts`
- [ ] Sempre incluir `credentials: 'include'` em todas as chamadas `fetch` à API

```typescript
// web/src/hooks/use-feature.ts
export function useFeatureList() {
  return useQuery({
    queryKey: ['feature'],
    queryFn: async () => {
      const res = await fetch('http://localhost:8080/api/v1/feature', {
        credentials: 'include', // obrigatório — envia o cookie de sessão
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
  })
}
```

### Passo 6 — Web: Componente de página

- [ ] Criar `web/src/components/pages/<feature>/<FeatureName>.tsx`
- [ ] Envolver conteúdo em `<Card>`
- [ ] Usar `LoadingButton` para ações assíncronas
- [ ] Todo texto visível ao usuário em português (pt-BR)

### Passo 7 — Web: Arquivo de rota

- [ ] Criar `web/src/routes/_dashboard/_pathlessLayout/<pagina-em-portugues>.tsx`
- [ ] O guard de autenticação é herdado do layout — não precisa de `beforeLoad` adicional

```typescript
import { createFileRoute } from "@tanstack/react-router"
import { FeatureName } from "@/components/pages/feature/FeatureName"

export const Route = createFileRoute("/_dashboard/_pathlessLayout/pagina")({
  component: RouteComponent,
})

function RouteComponent() {
  return <FeatureName />
}
```

### Passo 8 — Web: Sidebar (se aplicável)

- [ ] Adicionar entrada no array `navMain` em `web/src/components/app-sidebar.tsx`

---

## Padrões Web

### Routing

- File-based routing via plugin Vite (`@tanstack/router-plugin/vite`)
- `web/src/routeTree.gen.ts` é **auto-gerado** — NUNCA editar manualmente
- `_dashboard/_pathlessLayout/` → páginas protegidas (requer login + 2FA)
- `_auth/_pathlessLayout/` → páginas públicas (login, redefinição de senha)
- Caminhos de rota em português, kebab-case: `/pagina-inicial`, `/relatorios`

### Formulários (React Hook Form + Zod)

```typescript
// 1. Schema em web/src/lib/validations.ts
export const novaSchema = z.object({
  campo: z.string().min(1, "Campo obrigatório"),
})
export type NovaType = z.infer<typeof novaSchema>

// 2. useForm no componente
const form = useForm<NovaType>({
  resolver: zodResolver(novaSchema),
  defaultValues: { campo: "" },
})

// 3. Formulário com Controller
<form id="minha-form" onSubmit={form.handleSubmit(onSubmit)}>
  <FieldGroup>
    <Controller
      name="campo"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field aria-busy={fieldState.isDirty}>
          <FieldLabel htmlFor="campo">Campo</FieldLabel>
          <Input id="campo" {...field} />
          {fieldState.error && (
            <FieldError errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  </FieldGroup>
</form>

// 4. LoadingButton fora do <form>, linkado via atributo form="id"
// Props exatas: { loading: boolean, disabled: boolean, label: string, form: string }
<LoadingButton
  form="minha-form"
  label="Salvar"
  loading={form.formState.isSubmitting}
  disabled={form.formState.disabled}
/>
```

### Chamadas à API

**Ações Better Auth** (login, logout, 2FA, reset de senha) — usar callbacks `fetchOptions`:
```typescript
await authClient.signIn.email({
  email,
  password,
  fetchOptions: {
    onError: (ctx) => toast.error(ctx.error.message),
    onSuccess: () => { /* ... */ },
  },
})
```

**CRUD customizado** — usar `fetch` com `credentials: 'include'`:
```typescript
const res = await fetch('http://localhost:8080/api/v1/recurso', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // sempre obrigatório
  body: JSON.stringify(data),
})
```

### Convenções UI

- `cn()` de `@/lib/utils` para classes condicionais (nunca concatenação de strings)
- `<Card>` para envolver conteúdo de página
- `toast.success()` / `toast.error()` via Sonner para feedback
- Ícones de `lucide-react`
- Dark mode via variantes `dark:` do Tailwind (não hardcodar cores)
- Alias de path: `@/*` → `web/src/*`

### Auth Context em componentes

```typescript
import { useAuth } from "@/auth"
const { user, isAuthenticated } = useAuth()

// Em hooks de lifecycle de rota (beforeLoad):
const user = ctx.context.auth.user
```

---

## Convenções Globais

| Convenção | Regra |
|---|---|
| Idioma | Texto ao usuário em português (pt-BR). Identificadores de código em inglês |
| Paths de rota | Português, kebab-case: `/pagina-inicial`, `/grupos-de-usuarios` |
| URL da API | `/api/v1/<domínio>/<recurso>` — substantivos no plural, kebab-case |
| TypeScript | Strict mode. Tipos sempre inferidos via `z.infer<>` — nunca declarar interfaces separadas para dados validados |
| Alias de path | `@/*` → `src/*` em ambos `api/` e `web/` |
| Variáveis de ambiente | API: sempre `import { env } from "@/lib/env"`. Nunca `process.env` |
| Feedback de erro | API retorna `status(code, message)`. Web exibe via `toast.error()` |

---

## Referência de Arquivos Chave

| Propósito | Arquivo |
|---|---|
| Config do auth client (web) | `web/src/lib/auth-client.ts` |
| AuthContext + `useAuth()` | `web/src/auth.tsx` |
| Setup do Router + QueryClient | `web/src/main.tsx` |
| Route tree (auto-gerado, não editar) | `web/src/routeTree.gen.ts` |
| Schemas Zod compartilhados (web) | `web/src/lib/validations.ts` |
| Utilitário `cn()` | `web/src/lib/utils.ts` |
| Layout do dashboard (guard de auth) | `web/src/routes/_dashboard/_pathlessLayout.tsx` |
| Layout de auth (redireciona se autenticado) | `web/src/routes/_auth/_pathlessLayout.tsx` |
| Navegação lateral | `web/src/components/app-sidebar.tsx` |
| Entry point da API | `api/src/index.ts` |
| Macros `auth` e `adminOnly` | `api/src/http/plugins/better-auth.ts` |
| Schema do banco — índice | `api/src/db/schema/index.ts` |
| Schema RBAC | `api/src/db/schema/rbac-schema.ts` |
| Validação de variáveis de ambiente (API) | `api/src/lib/env.ts` |
| **Guia completo de padrões da API** | `api/CLAUDE.md` |

---

## O Que NÃO Fazer

- **Não editar** `web/src/routeTree.gen.ts` — é auto-gerado pelo plugin Vite
- **Não editar** `api/src/db/schema/auth-schema.ts` — gerenciado pelo Better Auth. Regenerar com `bun run auth:generate`
- **Não adicionar** novos roles Better Auth para controle de acesso fino — usar o sistema de grupos RBAC
- **Não usar** `process.env` na API — usar `env` de `@/lib/env`
- **Não omitir** `credentials: 'include'` em chamadas `fetch` customizadas à API
- **Não usar** `isLoading` no `LoadingButton` — a prop correta é `loading`
- **Não colocar** rotas autenticadas fora de `_dashboard/_pathlessLayout/`
- **Não usar** `.defaultNow()` no schema Drizzle — sempre `$defaultFn(() => new Date())`
- **Não lançar** erros nos services da API — retornar `status(code, message)`
