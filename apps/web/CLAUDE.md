# Portal Coop — Web (`apps/web`)

SPA React com roteamento file-based, server state via TanStack Query e autenticação via Better Auth. Leia o [`CLAUDE.md` raiz](../../CLAUDE.md) para convenções globais e checklist de nova feature.

---

## Stack

| Pacote | Versão |
|---|---|
| React | 19.2 |
| TanStack Router | 1.168 |
| TanStack Query | 5.99 |
| TanStack Table | 8.21 |
| React Hook Form | 7.72 |
| Zod | 4.3 |
| @base-ui/react | 1.4 |
| Tailwind CSS | 4.2 |
| Better Auth client | 1.6 |
| Axios | 1.x |
| Sonner | 2.0 |

---

## Estrutura de `src/`

```
src/
├── main.tsx                          # Entry point: QueryClient + Router + AuthProvider + Toaster
├── auth.tsx                          # AuthContext, AuthProvider, useAuth()
├── routeTree.gen.ts                  # AUTO-GERADO pelo plugin Vite — NUNCA editar
├── index.css                         # Estilos globais
│
├── routes/
│   ├── __root.tsx                    # Layout raiz (providers de contexto)
│   ├── index.tsx                     # / → redireciona conforme auth state
│   ├── _auth/_pathlessLayout.tsx     # Layout público (centralizado, sem sidebar)
│   ├── _auth/_pathlessLayout/        # login, habilitar-2fa, verificar-2fa, redefinicao-de-senha
│   ├── _dashboard/_pathlessLayout.tsx  # Layout protegido (sidebar + header + breadcrumb)
│   └── _dashboard/_pathlessLayout/
│       ├── pagina-inicial.tsx
│       ├── governanca-analitica/
│       │   ├── atualizar-relatorios.tsx
│       │   └── formatar-planilha.tsx
│       └── administracao/
│           ├── _pathlessLayout.tsx
│           └── _pathlessLayout/
│               ├── index.tsx         # AdminHome — lista todas as ferramentas do admin
│               ├── usuarios.tsx      # Gestão de usuários
│               ├── usuario.$userId.tsx  # Edição de usuário (dados, status, senha, sessões, vínculo org)
│               ├── modulos.tsx       # Catálogo de módulos (somente leitura — acesso via grupos)
│               ├── agencias.tsx      # CRUD de agências
│               ├── setores.tsx       # CRUD de setores + áreas (expandable rows)
│               ├── funcoes.tsx       # CRUD de funções/cargos
│               └── grupos.tsx        # CRUD de grupos RBAC
│
├── components/
│   ├── app-sidebar.tsx               # Sidebar principal — filtra módulos pelo status ativo do backend
│   ├── nav-projects.tsx              # Navegação por módulos (usa lib/modules-types.ts)
│   ├── nav-main.tsx                  # Itens colapsáveis com subitems
│   ├── nav-secondary.tsx             # Navegação secundária genérica da sidebar
│   ├── nav-user.tsx                  # Dropdown de perfil no rodapé da sidebar
│   ├── mode-toggle.tsx               # Alternador dark/light/system
│   ├── theme-provider.tsx            # Provider de tema (wraps main.tsx)
│   ├── pages/
│   │   ├── administracao/
│   │   │   ├── admin-home.tsx        # Página inicial do painel admin (grid de funcionalidades)
│   │   │   ├── modulos/
│   │   │   │   ├── modules-home.tsx
│   │   │   │   └── modules-table.tsx  # Somente leitura — sem toggle
│   │   │   ├── agencias/
│   │   │   │   ├── agencies-home.tsx
│   │   │   │   ├── agencies-table.tsx
│   │   │   │   └── agency-form.tsx   # Reutilizável: modo "create" e "edit"
│   │   │   ├── setores/
│   │   │   │   ├── sectors-home.tsx
│   │   │   │   ├── sectors-table.tsx # Tabela com expandable rows para áreas
│   │   │   │   ├── sector-form.tsx
│   │   │   │   └── area-form.tsx
│   │   │   ├── funcoes/
│   │   │   │   ├── job-functions-home.tsx
│   │   │   │   ├── job-functions-table.tsx
│   │   │   │   ├── job-function-form.tsx
│   │   │   │   └── job-function-users-dialog.tsx  # Lista usuários com determinada função
│   │   │   ├── grupos/
│   │   │   │   ├── grupos-home.tsx
│   │   │   │   ├── grupos-table.tsx  # Tabela com dialogs de módulos e usuários
│   │   │   │   └── grupo-form.tsx    # Reutilizável: modo "create" e "edit"
│   │   │   └── user/
│   │   │       ├── user-home.tsx
│   │   │       ├── users-table.tsx
│   │   │       ├── users-tools-bar.tsx
│   │   │       ├── user-form.tsx
│   │   │       ├── edit-user.tsx     # Grid de 5 cards: dados, status, senha, sessões, vínculo org
│   │   │       ├── ban-user.tsx
│   │   │       └── org-profile-card.tsx  # Card 5: vínculo org (agência, setor, área, função)
│   │   ├── authentication/
│   │   │   └── login-form.tsx
│   │   ├── reset-password/
│   │   │   ├── request.tsx
│   │   │   └── reset-password.tsx
│   │   └── two-factor/
│   │       ├── enable.tsx
│   │       ├── verify.tsx
│   │       └── verify-totp-form-to-enable.tsx
│   ├── customs-pages/                # Páginas de erro e loading
│   └── ui/                           # 60 componentes base (shadcn / Base UI)
│
├── hooks/
│   ├── use-admin.ts          # Operações Better Auth (usuários, sessões, ban/unban)
│   ├── use-mobile.ts         # Detecção de viewport mobile
│   ├── use-active-modules.ts # GET /modules/active — slugs ativos para filtrar sidebar
│   ├── use-modules-admin.ts  # GET /modules (todos) — somente leitura, sem toggle
│   ├── use-agencies.ts       # CRUD /agencies — exporta tipo `Agency` (sem isActive/description)
│   ├── use-sectors.ts        # CRUD /sectors + /areas — exporta tipos `Sector`, `Area` (sem isActive/description)
│   ├── use-job-functions.ts  # CRUD /job-functions (sem isActive/description)
│   ├── use-groups.ts         # CRUD /groups + setGroupModules + setGroupUsers — exporta tipos `Group`, `GroupModule`, `GroupUser`
│   └── use-org-profile.ts    # GET/PUT /users/:userId/org-profile
│
└── lib/
    ├── validations.ts        # Schemas Zod + tipos inferidos (única fonte de verdade)
    ├── modules-types.ts      # Configuração estática de módulos/sidebar
    ├── auth-client.ts        # Instância do Better Auth client
    ├── axios-client.ts       # Cliente Axios centralizado — withCredentials + interceptor de erros
    └── utils.ts              # cn() para merge de classes Tailwind
```

---

## Routing

### Localização dos arquivos

| Tipo de rota | Pasta |
|---|---|
| Página protegida (requer login + 2FA) | `routes/_dashboard/_pathlessLayout/` |
| Página pública (login, reset, habilitar 2FA) | `routes/_auth/_pathlessLayout/` |

### Rota simples

```typescript
// routes/_dashboard/_pathlessLayout/minha-pagina.tsx
import { createFileRoute } from "@tanstack/react-router"
import { MinhaPage } from "@/components/pages/minha-feature/MinhaPage"

export const Route = createFileRoute("/_dashboard/_pathlessLayout/minha-pagina")({
  component: RouteComponent,
})

function RouteComponent() {
  return <MinhaPage />
}
```

### Rota com search params validados

```typescript
// Definir schema no topo do arquivo ou importar de validations.ts
const searchSchema = z.object({ search: z.string().optional() })

export const Route = createFileRoute("/_dashboard/_pathlessLayout/minha-pagina")({
  validateSearch: (search) => searchSchema.parse(search),
  component: RouteComponent,
})

function RouteComponent() {
  const { search } = Route.useSearch()
  // ...
}
```

### Rota com parâmetro dinâmico

```typescript
// Arquivo: routes/_dashboard/_pathlessLayout/recurso.$recursoId.tsx
export const Route = createFileRoute("/_dashboard/_pathlessLayout/recurso/$recursoId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { recursoId } = Route.useParams()
  // ...
}
```

> **Nunca editar** `routeTree.gen.ts` — é regenerado automaticamente pelo plugin Vite ao salvar qualquer arquivo de rota.

---

## Guards de Módulo (RBAC via grupos)

Módulos marcados com `gated: true` em `modules-types.ts` exigem um **layout guard** que impede acesso direto via URL mesmo que o módulo não apareça na sidebar do usuário.

### Padrão obrigatório para módulos `gated: true`

Cada módulo gated deve ter um pathless layout intermediário que verifica se o usuário possui o módulo via `useActiveModules()`. A estrutura de pastas segue o mesmo padrão do guard de auth do dashboard:

```
routes/_dashboard/_pathlessLayout/<modulo>/
├── _pathlessLayout.tsx       ← guard: verifica acesso ao módulo
└── _pathlessLayout/          ← rotas do módulo (URLs não mudam)
    ├── index.tsx
    ├── sub-pagina-a.tsx
    └── sub-pagina-b.tsx
```

### Como criar o guard

```typescript
// routes/_dashboard/_pathlessLayout/<modulo>/_pathlessLayout.tsx
import { ForbiddenPage } from "@/components/customs-pages/errors-page"
import { LoadingComponent } from "@/components/customs-pages/loading-page"
import { useActiveModules } from "@/hooks/use-active-modules"
import { createFileRoute, Outlet } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_dashboard/_pathlessLayout/<modulo>/_pathlessLayout"
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { activeSlugs, isPending } = useActiveModules()

  if (isPending) return <LoadingComponent />
  if (!activeSlugs?.includes("<slug-do-modulo>")) return <ForbiddenPage />
  return <Outlet />
}
```

### Atualizar `createFileRoute` nas rotas filhas

Ao mover as rotas para `_pathlessLayout/`, o caminho do `createFileRoute` ganha o segmento `_pathlessLayout` antes do nome da rota — mas a URL pública **não muda** (segmento pathless):

```typescript
// antes (sem guard)
createFileRoute("/_dashboard/_pathlessLayout/<modulo>/sub-pagina")

// depois (com guard)
createFileRoute("/_dashboard/_pathlessLayout/<modulo>/_pathlessLayout/sub-pagina")
```

### Exemplo real: `dashboards-internos`

```
routes/_dashboard/_pathlessLayout/dashboards-internos/
├── _pathlessLayout.tsx              ← verifica slug "dashboards-internos"
└── _pathlessLayout/
    ├── index.tsx
    ├── atualizar-relatorios.tsx
    └── formatar-planilha.tsx
```

### Por que não usar `beforeLoad`

O `beforeLoad` precisaria do `queryClient` no contexto do router. A abordagem de componente é mais simples, segue o mesmo padrão do guard de auth já existente em `_dashboard/_pathlessLayout.tsx`, e os dados de `useActiveModules` já estão em cache quando o sidebar os carregou (staleTime: 5 min).

### Comportamento do guard

| Estado | Resultado |
|---|---|
| `isPending = true` | Exibe `<LoadingComponent />` (spinner) |
| `activeSlugs` não contém o slug | Exibe `<ForbiddenPage />` (403) |
| `activeSlugs = null` (erro na query) | Exibe `<ForbiddenPage />` (fail closed — mais seguro) |
| `activeSlugs` contém o slug | Renderiza `<Outlet />` normalmente |

---

## Formulários (React Hook Form + Zod)

### 1. Schema em `src/lib/validations.ts`

```typescript
// Reutilize os field validators já existentes quando possível
export const minhaSchema = z.object({
  nome: name,      // já exportado: z.string().trim().min(1)
  email,           // já exportado com validação de email
  descricao: z.string().trim().min(1, "Campo obrigatório"),
})
export type MinhaTipo = z.infer<typeof minhaSchema>
```

### 2. Formulário no componente

```typescript
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { minhaSchema, type MinhaTipo } from "@/lib/validations"

export function MinhaPage() {
  const form = useForm<MinhaTipo>({
    resolver: zodResolver(minhaSchema),
    defaultValues: { nome: "", email: "", descricao: "" },
  })

  async function onSubmit(data: MinhaTipo) {
    // chamada à API — toast.error() no catch
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
      </CardHeader>
      <CardPanel>
        {/* form com id — LoadingButton fica FORA mas vinculado via form="id" */}
        <form id="minha-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="nome"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="nome">Nome</FieldLabel>
                  <Input id="nome" {...field} />
                  {fieldState.error && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardPanel>
      <CardFooter>
        <LoadingButton
          form="minha-form"
          label="Salvar"
          loading={form.formState.isSubmitting}
          disabled={form.formState.disabled}
        />
      </CardFooter>
    </Card>
  )
}
```

> Não adicionar `aria-busy` nos `<Field>` — não tem semântica ARIA correta para dirty state.

### Formulário em Dialog

```typescript
<Dialog>
  <DialogTrigger render={<Button><PlusIcon /> Novo</Button>} />
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Dialog</DialogTitle>
    </DialogHeader>
    <form id="dialog-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>{/* campos */}</FieldGroup>
    </form>
    <DialogFooter>
      <DialogClose render={<Button variant="outline">Cancelar</Button>} />
      <LoadingButton form="dialog-form" label="Salvar" loading={form.formState.isSubmitting} />
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Dialog com fechar programático

Quando o dialog precisa fechar após submissão bem-sucedida, usar `ref` no `DialogClose`:

```typescript
const closeRef = useRef<HTMLButtonElement>(null)

async function onSubmit(data: MeuTipo) {
  await minhaAcao(data).then(() => {
    form.reset()
    closeRef.current?.click()   // fecha o dialog
  })
}

// No JSX:
<DialogClose ref={closeRef} render={<Button variant="outline">Cancelar</Button>} />
```

### IDs de formulário em dialogs com múltiplas instâncias

Quando um componente de dialog pode existir múltiplas vezes na tela (ex: um botão de editar por linha de tabela), usar `useId()` para gerar IDs únicos:

```typescript
const instanceId = useId()
const formId = `area-edit-form-${instanceId}`

<form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
  {/* ... */}
</form>
<LoadingButton form={formId} label="Salvar" loading={loading} />
```

**Não derivar o `formId` do `mode` ("create" | "edit")** — todos os formulários em modo edit compartilhariam o mesmo id.

---

## Cliente HTTP (`lib/axios-client.ts`)

**Todo CRUD customizado usa `api` do axios-client** — nunca `fetch` direto.

```typescript
import { api } from "@/lib/axios-client"
```

O cliente já configura `baseURL`, `withCredentials: true` (equivalente a `credentials: "include"`) e um interceptor que normaliza mensagens de erro da API:

```typescript
export const api = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  timeout: 10_000,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message ?? err.message ?? "Erro desconhecido"
    return Promise.reject(new Error(message))
  },
)
```

**Ações Better Auth** (login, logout, 2FA, reset de senha) — usar `authClient.*` com callbacks `fetchOptions`:

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

---

## TanStack Query Hooks

### Localização: `src/hooks/use-<feature>.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { api } from "@/lib/axios-client"
import type { MinhaType } from "@/lib/validations"

export function useFeature() {
  const queryClient = useQueryClient()

  // Query
  const { data, isPending: carregando } = useQuery({
    queryKey: ["feature"],
    queryFn: () => api.get<MinhaType[]>("/feature").then((r) => r.data),
    staleTime: 60_000,
  })

  // Mutation
  const { mutateAsync: criar, isPending: criando } = useMutation({
    mutationFn: (dados: MinhaType) =>
      api.post("/feature", dados).then((r) => r.data),
    onSuccess: () => {
      toast.success("Criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["feature"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return { itens: data, carregando, criar, criando }
}
```

### Regras dos hooks

- Retornar dados + flags `isPending` renomeadas descritivamente + funções de mutação
- Invalidar todas as queries relacionadas no `onSuccess` de cada mutation
- `enabled: !!id` quando a query depende de um parâmetro opcional
- Para operações Better Auth (admin), usar `authClient.admin.*` com `onError` via callback — ver `src/hooks/use-admin.ts`
- Usar `staleTime` adequado: módulos ativos → `5 * 60 * 1000`, dados de lista → `60_000`

### `use-groups.ts`

Hook para gerenciamento de grupos RBAC. Exporta três funções:

```typescript
// Busca módulos de um grupo específico (lazy — só executa quando groupId !== null)
useGroupModules(groupId: string | null)
// → { groupModules: GroupModule[], fetchingGroupModules }

// Busca usuários de um grupo específico (lazy)
useGroupUsers(groupId: string | null)
// → { groupUsers: GroupUser[], fetchingGroupUsers }

// CRUD completo + atribuição de módulos e usuários
useGroups()
// → { groups, fetchingGroups, createGroup, creatingGroup,
//     updateGroup, updatingGroup, removeGroup, removingGroup,
//     setGroupModules, settingGroupModules, setGroupUsers, settingGroupUsers }
```

`setGroupModules({ groupId, moduleIds })` → `PUT /groups/:id/modules` — invalida `["groups"]`, `["groups", id, "modules"]` e `["modules", "active"]`.

`setGroupUsers({ groupId, userIds })` → `PUT /groups/:id/users` — invalida `["groups"]` e `["groups", id, "users"]`.

---

### `use-active-modules.ts`

Hook dedicado para a sidebar — consulta apenas os módulos com `isActive: true`:

```typescript
export function useActiveModules() {
  const { data, isPending } = useQuery({
    queryKey: ["modules", "active"],
    queryFn: () => api.get<ModuleItem[]>("/modules/active").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
  return { activeSlugs: data?.map((m) => m.slug) ?? null, isPending }
}
```

Quando o admin alterna um módulo via `use-modules-admin.ts`, invalidar **ambas** as queries:

```typescript
queryClient.invalidateQueries({ queryKey: ["modules-admin"] })
queryClient.invalidateQueries({ queryKey: ["modules", "active"] })
```

---

## Tabelas (TanStack Table)

```typescript
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import { CardFrame, CardFrameFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// 1. Definir colunas fora do componente
const columns: ColumnDef<MeuTipo>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
    size: 180,
  },
  {
    id: "acoes",
    header: "",
    size: 60,
    enableSorting: false,
    cell: ({ row, table }) => {
      const { deletar } = table.options.meta!
      return <BotaoAcoes item={row.original} deletar={deletar} />
    },
  },
]

// 2. Declarar meta tipado (evita any)
declare module "@tanstack/react-table" {
  interface TableMeta<TData> {
    deletar: (id: string) => Promise<unknown>
  }
}

// 3. Componente da tabela — incluindo o padrão aria-sort nos headers ordenáveis
export function MinhaTabela({ itens, deletar }: Props) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "nome", desc: false }])

  const table = useReactTable({
    columns,
    data: itens ?? [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    meta: { deletar },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: { pagination, sorting },
  })

  return (
    <CardFrame>
      <Table variant="card">
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow className="hover:bg-transparent" key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead
                  key={h.id}
                  style={h.column.getSize() ? { width: `${h.column.getSize()}px` } : undefined}
                  aria-sort={
                    h.column.getCanSort()
                      ? h.column.getIsSorted() === "asc"
                        ? "ascending"
                        : h.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {h.isPlaceholder ? null : h.column.getCanSort() ? (
                    <div
                      className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                      onClick={h.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          h.column.getToggleSortingHandler()?.(e)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{
                        asc: <ChevronUpIcon aria-hidden="true" className="size-4 shrink-0 opacity-80" />,
                        desc: <ChevronDownIcon aria-hidden="true" className="size-4 shrink-0 opacity-80" />,
                      }[h.column.getIsSorted() as string] ?? null}
                    </div>
                  ) : (
                    flexRender(h.column.columnDef.header, h.getContext())
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <CardFrameFooter className="p-2">
        {/* controles de paginação */}
      </CardFrameFooter>
    </CardFrame>
  )
}
```

### Tabela com expandable rows (ex: Setores → Áreas)

Para relações pai/filho onde o filho está embutido no pai (ex: setor com `areas[]`):

```typescript
import { getExpandedRowModel, type ExpandedState } from "@tanstack/react-table"

const [expanded, setExpanded] = useState<ExpandedState>({})

const table = useReactTable({
  // ...
  getExpandedRowModel: getExpandedRowModel(),
  onExpandedChange: setExpanded,
  state: { ..., expanded },
})

// Coluna de toggle:
{
  id: "expander",
  size: 48,
  cell: ({ row }) => (
    <Button onClick={row.getToggleExpandedHandler()}>
      {row.getIsExpanded() ? <ChevronDownIcon /> : <ChevronRightIcon />}
    </Button>
  ),
}

// Renderizar linha expandida após a linha principal:
{row.getIsExpanded() && (
  <TableRow key={`${row.id}-expanded`} className="hover:bg-transparent">
    <TableCell colSpan={columns.length} className="p-0">
      <SubTabela dados={row.original.filhos} />
    </TableCell>
  </TableRow>
)}
```

Ver `sectors-table.tsx` como referência de implementação completa.

---

## Validações — Schemas disponíveis

Todos os schemas ficam em `src/lib/validations.ts`.

| Schema / Tipo | Uso |
|---|---|
| `email` | Validator de e-mail reutilizável |
| `name` | `z.string().trim().min(1)` — campo obrigatório padrão |
| `password` | Senha com requisitos de complexidade |
| `role` | `z.enum(["admin", "user"])` |
| `ROLE_LABELS` | `Record<"user"\|"admin", string>` — labels PT-BR para exibição nos selects |
| `loginSchema` / `LoginType` | Formulário de login |
| `codeSchema` / `CodeType` | Código TOTP 6 dígitos |
| `searchSchema` / `SearchType` | Parâmetro de busca em URL |
| `addUserSchema` / `AddUser` | Criar usuário (admin) |
| `editUserSchema` / `EditUserType` | Editar dados do usuário |
| `userStatusSchema` / `UserStatusType` | Alterar situação (ban) |
| `USER_STATUS_TYPES` | Array `{ value, label }[]` — opções de status em PT-BR |
| `setPasswordSchema` / `SetPasswordType` | Redefinir senha |
| `catalogSchema` / `CatalogType` | `{ name }` — shared por agências, setores, áreas, funções (sem description) |
| `groupSchema` / `GroupType` | `{ name, description? }` — grupos RBAC |
| `orgProfileSchema` / `OrgProfileType` | `{ agencyId, sectorId, areaId, jobFunctionId }` — todos nullable |

---

## Componentes UI — Referência Rápida

### Card system

| Componente | Uso |
|---|---|
| `Card` | Container de página/seção |
| `CardHeader` | Topo do card (título + descrição) |
| `CardTitle` | Título grande |
| `CardDescription` | Subtítulo |
| `CardPanel` / `CardContent` | Corpo do card (flex-1) |
| `CardFooter` | Rodapé do card (ações) |
| `CardFrame` | Agrupa cards internos (ex: wrapper de tabela) |
| `CardFrameHeader/Footer` | Header/footer do CardFrame |

### Field system (formulários)

| Componente | Uso |
|---|---|
| `FieldGroup` | Agrupa múltiplos `Field` com espaçamento |
| `Field` | Wrapper de um campo (prop `orientation`: vertical/horizontal/responsive) |
| `FieldLabel` | Label do campo |
| `FieldError` | Exibe erros (`errors={[fieldState.error]}`) |
| `FieldDescription` | Texto auxiliar abaixo do campo |

### LoadingButton

```typescript
// Props obrigatórias
<LoadingButton
  form="id-do-form"   // vincula ao <form id="id-do-form">
  label="Salvar"
  loading={form.formState.isSubmitting}  // NÃO usar isLoading
  disabled={form.formState.disabled}
/>
```

`LoadingButton` renderiza `type="submit"` e **não aceita `onClick`**. Precisa obrigatoriamente de um `<form>` com `id` correspondente.

Em dialogs sem React Hook Form (ex: checklist de seleção), usar um `<form>` oculto:

```typescript
const formId = `minha-acao-form-${item.id}`  // id único por instância

async function handleSave() {
  await minhaAcao(...)
  setOpen(false)
}

// No JSX — form vazio antes do conteúdo:
<form id={formId} onSubmit={(e) => { e.preventDefault(); void handleSave() }} />

// LoadingButton no footer, vinculado ao form:
<LoadingButton form={formId} label="Salvar" loading={salvando} disabled={salvando} />
```

### Button variants

`default` | `outline` | `ghost` | `destructive` | `destructive-outline` | `secondary` | `link`

### DeleteAlert (confirmação de exclusão)

```typescript
<DeleteAlert
  label="Excluir Item"
  onAccept={async () => deletar(item.id)}
  disabled={deletando}
  variant="destructive-outline"  // default quando em DropdownMenu
/>
```

### Select (Base UI)

O `Select.Value` do Base UI resolve o texto do item selecionado via registro interno do `ItemText` — mecanismo que só funciona após o popup ser aberto pela primeira vez. Para garantir exibição correta desde o carregamento inicial, **sempre passe o label computado como `children` do `SelectValue`**:

```typescript
import { Select, SelectItem, SelectPopup, SelectTrigger, SelectValue } from "@/components/ui/select"

// Opções estáticas (ex: role) — usar um mapa de labels
const ROLE_LABELS = { user: "Usuário", admin: "Administrador" }

<Select name={field.name} value={field.value} onValueChange={field.onChange}>
  <SelectTrigger id="meu-select" aria-invalid={fieldState.invalid}>
    <SelectValue placeholder="Selecione">
      {field.value ? ROLE_LABELS[field.value as keyof typeof ROLE_LABELS] : null}
    </SelectValue>
  </SelectTrigger>
  <SelectPopup>
    <SelectItem value="user">Usuário</SelectItem>
    <SelectItem value="admin">Administrador</SelectItem>
  </SelectPopup>
</Select>
```

> Para `role`, usar `ROLE_LABELS` de `validations.ts` — não redeclarar localmente.

> `SelectContent` é um alias de `SelectPopup` — preferir `SelectPopup`.

### Select com valor nullable

Quando o campo pode ser `null` (ex: perfil organizacional), combinar o `NONE = ""` com lookup no array de dados:

```typescript
const NONE = ""

<Select
  value={field.value ?? NONE}
  onValueChange={(v) => field.onChange(v === NONE ? null : v)}
>
  <SelectTrigger id="org-agency">
    <SelectValue placeholder="Nenhuma">
      {field.value ? (opcoes?.find(o => o.id === field.value)?.name ?? null) : null}
    </SelectValue>
  </SelectTrigger>
  <SelectPopup>
    <SelectItem value={NONE}>Nenhuma</SelectItem>
    {opcoes?.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
  </SelectPopup>
</Select>
```

### Toast (Sonner)

```typescript
toast.success("Mensagem de sucesso")
toast.error("Mensagem de erro")
toast.loading("Carregando...")
```

### Badge

```typescript
<Badge>Ativo</Badge>
<Badge variant="outline">
  <span className={cn("size-1.5 rounded-full", ativo ? "bg-emerald-500" : "bg-red-500")} />
  {ativo ? "Ativo" : "Inativo"}
</Badge>
```

---

## Módulos & Sidebar

### Conexão com o backend

A sidebar exibe apenas módulos com `isActive: true` no banco. O `app-sidebar.tsx` usa `useActiveModules()` para obter os slugs ativos e filtrar o array estático de `modules-types.ts`:

```typescript
const { activeSlugs, isPending } = useActiveModules()
const visibleModules = activeSlugs
  ? modules.filter((m) => activeSlugs.includes(m.url.slice(1)))
  : modules
```

- `m.url.slice(1)` remove o `/` inicial para comparar com o slug do backend (`"/pagina-inicial"` → `"pagina-inicial"`)
- Enquanto `isPending`, exibir 3 `<Skeleton>` no lugar dos itens
- Ao alternar um módulo via `/administracao/modulos`, invalidar `["modules", "active"]` para que a sidebar atualize imediatamente

### Adicionar novo módulo ao menu

Editar `src/lib/modules-types.ts`:

```typescript
export interface ModulesProps {
  label: string          // Texto exibido
  url: string            // URL base do módulo — deve corresponder ao slug no backend sem o "/"
  icon: LucideIcon       // Ícone lucide-react
  onSidebar: boolean     // true = aparece na sidebar principal; false = acessível só pelo header
  gated: boolean         // true = visível apenas se o usuário tiver o módulo via grupo RBAC; false = sempre visível (ex: Página Inicial, Administração)
  menu: {
    label: string
    url: string
    icon: LucideIcon
    description: string
    submenu?: { label: string; pattern: RegExp }[]
  }[] | null             // null = módulo sem submenu (ex: Página Inicial)
}
```

### Módulos atuais

| Módulo | `url` | `slug` backend | `onSidebar` | `gated` | Itens de menu |
|---|---|---|---|---|---|
| Página Inicial | `/pagina-inicial` | — | `true` | `false` | — |
| Dashboards Internos | `/dashboards-internos` | `dashboards-internos` | `true` | `true` | Atualizar Relatórios, Formatar Planilha |
| Painel de Administração | `/administracao` | — | `false` | `false` | Usuários, Módulos, Agências, Setores, Funções, Grupos |

> `onSidebar: false` significa que o módulo aparece no header mas não na sidebar principal. Os itens do menu são exibidos na `AdminHome` como cards acessíveis.

> O breadcrumb do dashboard é gerado automaticamente a partir deste array.

---

## Fluxo 2FA

### Verificação de login (`verify.tsx`)

- Título: "Verificar identidade"
- Descrição: "Digite o código do seu aplicativo autenticador."
- `<InputOTP>` com `aria-label="Código de autenticação de 6 dígitos"`

### Habilitação inicial (`enable.tsx` + `verify-totp-form-to-enable.tsx`)

O URI TOTP é armazenado em `sessionStorage` (não `localStorage`) com chave fixa `"2fa-totp-uri"`. Isso evita estado stale entre sessões — o `sessionStorage` é limpo automaticamente quando a aba é fechada.

Fluxo completo:

1. **Etapa 1** (`enable.tsx`): chama `authClient.twoFactor.enable()` → armazena URI no `sessionStorage` → captura `backupCodes` de `context.data.backupCodes` → passa para `VerifyTotpFormToEnable`
2. **Etapa 2** (`verify-totp-form-to-enable.tsx`):
   - Exibe QR code gerado a partir do URI do `sessionStorage`
   - `<details>` colapsável "Não consigo escanear o QR code" → exibe o secret extraído do URI, formatado em grupos `XXXX XXXX XXXX XXXX`
   - Após verificação TOTP com sucesso → exibe tela de backup codes (não redireciona imediatamente)
3. **Tela de backup codes**: grid 2 colunas com os códigos em fonte mono, botão "Copiar todos" (`navigator.clipboard`), checkbox "Já salvei meus códigos de recuperação", botão "Continuar para o portal" (desabilitado até checkbox marcado)

### Guard do layout de auth

O guard em `routes/_auth/_pathlessLayout.tsx` redireciona **somente** usuários autenticados com 2FA habilitado:

```typescript
if (ctx.context.auth.user && ctx.context.auth.user.twoFactorEnabled) {
  throw redirect({ to: "/" })
}
```

Isso é intencional — usuários autenticados sem 2FA ainda precisam acessar `/habilitar-2fa` (que está sob este layout). Alterar para `if (user)` causaria loop infinito.

---

## Auth em Componentes

```typescript
// Em componentes React:
import { useAuth } from "@/auth"
const { user, isAuthenticated } = useAuth()

// Em hooks de lifecycle de rota (beforeLoad, loader):
const user = ctx.context.auth.user
const isAuthenticated = ctx.context.auth.isAuthenticated

// Verificar role:
if (user?.role === "admin") { /* ... */ }

// Verificar 2FA:
if (!user?.twoFactorEnabled) { /* ... */ }
```

---

## Padrões de componentes por domínio

### Catálogos organizacionais (agências, setores, funções)

Todos seguem o mesmo padrão de 3 arquivos:

```
<dominio>/
├── <dominio>-home.tsx      # Usa o hook, renderiza DefaultHeader + toolbar + tabela
├── <dominio>-table.tsx     # TanStack Table com declare module TableMeta
└── <dominio>-form.tsx      # Dialog reutilizável modo "create" | "edit"
```

O formulário expõe dois componentes auxiliares:
- `<DominioCreateButton>` — trigger "Novo X" para a toolbar
- `<DominioEditButton>` — trigger ícone de lápis para o dropdown de ações

O `formId` deve ser uma string fixa e única (ex: `"agency-edit-form"`), **não** derivado do `mode` — caso contrário o formulário sempre recebe o mesmo id independente do modo. Em componentes com múltiplas instâncias simultâneas (ex: um edit button por linha), usar `useId()` para gerar ids únicos.

### Grupos RBAC

A feature de grupos usa o mesmo padrão de 3 arquivos dos catálogos, com dialogs adicionais na tabela:

- **`grupo-form.tsx`**: formulário create/edit com `name` (obrigatório) e `description` (opcional). Exporta `GrupoCreateButton` e `GrupoEditButton`.
- **`grupos-table.tsx`**: tabela com 3 ações no dropdown de cada linha:
  1. `GrupoEditButton` — editar nome/descrição
  2. **Dialog "Gerenciar Módulos"** — checklist de todos os módulos (`useModulesAdmin`) com seleção atual do grupo (`useGroupModules`). Salva via `setGroupModules`.
  3. **Dialog "Gerenciar Usuários"** — checklist de todos os usuários (`authClient.admin.listUsers`) com campo de busca e seleção atual do grupo (`useGroupUsers`). Salva via `setGroupUsers`.

Os dialogs de checklist usam `<form id="..." onSubmit={...} />` oculto para vincular o `LoadingButton` sem React Hook Form.

Os dados de módulos e usuários do grupo são carregados de forma lazy — a query só é habilitada quando o dialog está aberto (`enabled: open`), via `useGroupModules(open ? group.id : null)`.

### Setores (com áreas)

A tabela de setores usa `getExpandedRowModel` para exibir uma sub-tabela de áreas inline. O `declare module TableMeta` inclui tanto as funções de setor quanto as de área, pois ambas são passadas via `meta`.

As áreas chegam embutidas na resposta de `GET /api/v1/sectors` — não é necessária query separada para expandir.

### Edição de usuário

A página `/administracao/usuario/$userId` renderiza um grid de 5 cards:

| Card | Arquivo | Descrição |
|---|---|---|
| Dados básicos | `edit-user.tsx` (inline) | Nome, e-mail, perfil |
| Situação da conta | `edit-user.tsx` + `ban-user.tsx` | Ban/unban, status |
| Redefinir senha | `edit-user.tsx` (inline) | Nova senha admin |
| Sessões ativas | `edit-user.tsx` (inline) | Revogar sessões |
| Vínculo organizacional | `org-profile-card.tsx` | Agência, setor, área, função |

---

## O Que NÃO Fazer (web-específico)

| Proibido | Motivo |
|---|---|
| Editar `routeTree.gen.ts` | Auto-gerado — será sobrescrito |
| Usar `loading={form.formState.isLoading}` | Prop correta é `loading`, estado correto é `isSubmitting` |
| Usar `fetch` direto para CRUD customizado | Usar `api` de `@/lib/axios-client` — já configura `withCredentials` e normaliza erros |
| Adicionar `aria-busy={fieldState.isDirty}` nos `<Field>` | `aria-busy` é para loading, não dirty state — não tem equivalente ARIA semântico |
| Hardcodar cores (ex: `text-gray-700`) | Usar variantes `dark:` e tokens de design (ex: `text-muted-foreground`) |
| Concatenar classes com string (`"btn " + variant`) | Usar `cn()` de `@/lib/utils` |
| Criar interfaces TypeScript separadas para dados de formulário | Usar `z.infer<typeof schema>` |
| Adicionar novos roles Better Auth para controle fino | Usar grupos RBAC |
| Colocar rotas autenticadas fora de `_dashboard/_pathlessLayout/` | O guard de auth é herdado do layout |
| Declarar schemas Zod manualmente para agências/setores/funções/áreas | Usar `catalogSchema` de `validations.ts` |
| Criar formulários create/edit separados para catálogos | Usar o padrão `mode: "create" \| "edit"` como em `agency-form.tsx` |
| Usar `localStorage` para armazenar URI TOTP | Usar `sessionStorage` — evita estado stale entre sessões de login diferentes |
| Omitir invalidação de `["modules", "active"]` ao alternar módulos | A sidebar não atualiza sem ela |
| `<SelectValue placeholder="..." />` sem `children` quando o valor já está definido | O Base UI resolve o texto via `ItemText` apenas após o popup ser aberto — com valor pré-carregado exibe o valor bruto. Sempre passar o label computado como `children` |
| Redeclarar `ROLE_LABELS` localmente nos componentes | Usar `ROLE_LABELS` de `validations.ts` |
| Passar `onClick` para `LoadingButton` | `LoadingButton` não aceita `onClick` — renderiza `type="submit"` e exige `form` prop. Usar um `<form id="..." onSubmit={...} />` oculto |
| Filtrar setores/áreas por `isActive` | Campo removido do backend — todos os setores e áreas são listados sem filtro de status |
| Usar `toggleModule`, `toggleAgency`, `toggleSector`, `toggleArea`, `toggleJobFunction` | Endpoints `/toggle` foram removidos do backend; os hooks não exportam mais essas funções |
