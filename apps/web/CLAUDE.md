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
│   └── _dashboard/_pathlessLayout/   # pagina-inicial, módulos protegidos...
│
├── components/
│   ├── app-sidebar.tsx               # Sidebar principal (logo + NavProjects + NavUser)
│   ├── nav-projects.tsx              # Navegação por módulos (usa lib/modules-types.ts)
│   ├── nav-main.tsx                  # Itens colapsáveis com subitems
│   ├── nav-user.tsx                  # Dropdown de perfil no rodapé da sidebar
│   ├── pages/                        # Componentes de página por feature
│   │   └── <domínio>/<Feature>.tsx
│   ├── customs-pages/                # Páginas de erro e loading
│   └── ui/                           # 60+ componentes base (shadcn / Base UI)
│
├── hooks/
│   └── use-<feature>.ts              # Hooks TanStack Query por domínio
│
└── lib/
    ├── validations.ts                # Schemas Zod + tipos inferidos (única fonte de verdade)
    ├── modules-types.ts              # Configuração de módulos/sidebar
    ├── auth-client.ts                # Instância do Better Auth client
    ├── axios-client.ts               # Instância Axios (baseURL configurada)
    └── utils.ts                      # cn() para merge de classes Tailwind
```

---

## Routing

### Localização dos arquivos

| Tipo de rota | Pasta |
|---|---|
| Página protegida (requer login + 2FA) | `routes/_dashboard/_pathlessLayout/` |
| Página pública (login, reset) | `routes/_auth/_pathlessLayout/` |

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
                <Field aria-busy={fieldState.isDirty}>
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

---

## TanStack Query Hooks

### Localização: `src/hooks/use-<feature>.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { MinhaType } from "@/lib/validations"

export function useFeature() {
  const queryClient = useQueryClient()

  // Query
  const { data, isPending: carregando } = useQuery({
    queryKey: ["feature"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8080/api/v1/feature", {
        credentials: "include", // SEMPRE obrigatório
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json() as Promise<MinhaType[]>
    },
  })

  // Mutation
  const { mutateAsync: criar, isPending: criando } = useMutation({
    mutationFn: async (dados: MinhaType) => {
      const res = await fetch("http://localhost:8080/api/v1/feature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(dados),
      })
      if (!res.ok) throw new Error(await res.text())
      return res.json()
    },
    onSuccess: () => {
      toast.success("Criado com sucesso!")
      queryClient.invalidateQueries({ queryKey: ["feature"] })
    },
    onError: (err) => toast.error(err.message),
  })

  return {
    itens: data,
    carregando,
    criar,
    criando,
  }
}
```

### Regras dos hooks

- Sempre retornar: dados + flags de loading (`isPending` renomeado para algo descritivo) + funções de mutação
- Invalidar as queries corretas no `onSuccess` de cada mutation
- `enabled: !!id` quando a query depende de um parâmetro opcional
- Para operações Better Auth (admin), usar `authClient.admin.*` com `onError` via callback — ver `src/hooks/use-admin.ts`

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
    cell: ({ row, table }) => {
      // Acesse callbacks via table.options.meta
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

// 3. Componente da tabela
export function MinhaTabela({ itens, deletar }: Props) {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 })
  const [sorting, setSorting] = useState<SortingState>([{ id: "nome", desc: false }])

  const table = useReactTable({
    columns,
    data: itens ?? [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
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

### Button variants

`default` | `outline` | `ghost` | `destructive` | `destructive-outline` | `secondary` | `link`

### DeleteAlert (confirmação de exclusão)

```typescript
<DeleteAlert
  label="Excluir Item"
  onAccept={async () => deletar(item.id)}
  disabled={deletando}
/>
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

Para adicionar uma nova seção ao menu lateral, editar `src/lib/modules-types.ts`:

```typescript
// Interface completa — respeitar todos os campos
export interface ModulesProps {
  label: string          // Texto exibido
  url: string            // URL base do módulo
  icon: LucideIcon       // Ícone lucide-react
  onSidebar: boolean     // true = aparece na sidebar principal; false = acessível só pelo header
  menu: {
    label: string
    url: string
    icon: LucideIcon
    description: string
    submenu?: { label: string; pattern: RegExp }[]  // para subpáginas (ex: detalhe de item)
  }[] | null             // null = módulo sem submenu (ex: Página Inicial)
}

// Adicionar ao array modules:
{
  label: "Meu Módulo",
  url: "/meu-modulo",
  icon: MinhaIcon,
  onSidebar: true,
  menu: [
    {
      label: "Sub-página",
      url: "/meu-modulo/sub-pagina",
      icon: SubIcon,
      description: "Descrição da sub-página",
      // submenu: opcional — só quando há rota filha dinâmica
    },
  ],
},
```

> O breadcrumb do dashboard é gerado automaticamente a partir deste array.

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

## O Que NÃO Fazer (web-específico)

| Proibido | Motivo |
|---|---|
| Editar `routeTree.gen.ts` | Auto-gerado — será sobrescrito |
| Usar `loading={form.formState.isLoading}` | Prop correta é `loading`, estado correto é `isSubmitting` |
| Omitir `credentials: 'include'` no fetch customizado | O cookie de sessão não é enviado sem isso |
| Hardcodar cores (ex: `text-gray-700`) | Usar variantes `dark:` e tokens de design (ex: `text-muted-foreground`) |
| Concatenar classes com string (`"btn " + variant`) | Usar `cn()` de `@/lib/utils` |
| Criar interfaces TypeScript separadas para dados de formulário | Usar `z.infer<typeof schema>` |
| Adicionar novos roles Better Auth para controle fino | Usar grupos RBAC |
| Colocar rotas autenticadas fora de `_dashboard/_pathlessLayout/` | O guard de auth é herdado do layout |
