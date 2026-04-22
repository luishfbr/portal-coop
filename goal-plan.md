# Plano: Módulo de Gestão de Metas

## Contexto

A cooperativa precisa acompanhar metas por indicador e por nível hierárquico (Cooperativa → Ponto de Atendimento → Gerente de Carteira). O realizado é inserido sempre no nível folha (gerente ou ponto) e consolidado automaticamente para cima. Os realizados podem ser atualizados manualmente ou via upload de planilha Excel — o pacote `xlsx` já está instalado na API.

---

## Decisões de design

| Pergunta | Decisão |
|---|---|
| Entidades da hierarquia | Cadastradas no próprio sistema (não vinculadas a usuários) |
| Nível do realizado | Sempre no nível folha; consolidado calculado on-demand |
| Atualização de realizados | Manual (PUT /:id/realizado) + upload de planilha (POST /importar-realizado) |
| Período | Anual com subdivisões — periodicidade é propriedade do indicador. Meta usa `ano` + `periodo` (inteiro 1-based). O sistema deriva as datas. |
| Periodicidades suportadas | `mensal` (12/ano), `bimestral` (6/ano), `trimestral` (4/ano), `semestral` (2/ano), `anual` (1/ano) |
| Tipos de medição | `contabil_decimal`, `percentual_decimal`, `contabil_inteiro` — sempre 2 casas decimais |
| Valor armazenado | `numeric(15,2)` — Drizzle retorna como string, service não converte |

---

## Arquitetura de arquivos

### Schema (novo)

**`api/src/db/schema/goals-schema.ts`** — toda a modelagem do domínio:

```
Enums:
  tipoMedicaoEnum     → "contabil_decimal" | "percentual_decimal" | "contabil_inteiro"
  nivelBaseEnum       → "gerente" | "ponto" | "cooperativa"
  periodicidadeEnum   → "mensal" | "bimestral" | "trimestral" | "semestral" | "anual"
  origemRealizadoEnum → "manual" | "planilha"

Tabelas:
  cooperativas          id, nome, cnpj (unique nullable)
  pontos_atendimento    id, nome, cooperativa_id FK(restrict)
  gerentes_carteira     id, nome, ponto_id FK(restrict)
  indicadores           id, nome, slug (unique), tipo_medicao, nivel_base,
                        periodicidade, ativo(bool)
  metas                 id, indicador_id FK, ano (integer), periodo (integer 1-based),
                        valor_meta, valor_realizado (nullable), origem_realizado (nullable),
                        gerente_id (nullable FK), ponto_id (nullable FK),
                        cooperativa_id (nullable FK)
```

**Período como `ano` + `periodo`:** o service valida que `periodo` está dentro do range permitido pela `periodicidade` do indicador (ex: bimestral aceita 1–6). A data exata de início/fim é derivada pela função utilitária `calcularPeriodo(ano, periodo, periodicidade)` → `{ dataInicio, dataFim }`.

**Unique indexes em `metas`** (3 separados — funciona corretamente porque o FK não-nulo garante unicidade para o nível certo):
- `uq_meta_gerente` ON (gerente_id, indicador_id, ano, periodo)
- `uq_meta_ponto` ON (ponto_id, indicador_id, ano, periodo)
- `uq_meta_cooperativa` ON (cooperativa_id, indicador_id, ano, periodo)

**Relations:** cada tabela com relações Drizzle para permitir `with:` nas queries.

**`api/src/db/schema/index.ts`** — adicionar `export * from "./goals-schema"` e incluir as 5 tabelas no objeto `schema`.

### Controllers

```
api/src/http/controllers/
├── config/                      # existente
└── metas/
    ├── index.ts                 # domain root — apenas agrupa sub-controllers
    ├── cooperativas/
    │   ├── model.ts
    │   ├── service.ts
    │   └── index.ts
    ├── pontos-atendimento/
    │   ├── model.ts
    │   ├── service.ts
    │   └── index.ts
    ├── gerentes-carteira/
    │   ├── model.ts
    │   ├── service.ts
    │   └── index.ts
    ├── indicadores/
    │   ├── model.ts
    │   ├── service.ts
    │   └── index.ts
    └── metas/
        ├── model.ts
        ├── service.ts
        └── index.ts
```

### Registro em `api/src/index.ts`

```typescript
import { metasController } from "./http/controllers/metas"
// ...
.use(metasController)
```

---

## Rotas da API

### Domain root controller — `metas/index.ts`

```typescript
export const metasController = new Elysia({ prefix: "/api/v1" })
  .use(cooperativasController)
  .use(pontosAtendimentoController)
  .use(gerentesCarteiraController)
  .use(indicadoresController)
  .use(metasGoalsController)
```

### Cooperativas — `/api/v1/cooperativas`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/` | auth | Listar todas |
| GET | `/:id` | auth | Buscar por id |
| POST | `/` | adminOnly | Criar |
| PUT | `/:id` | adminOnly | Atualizar |
| DELETE | `/:id` | adminOnly | Excluir |

### Pontos de Atendimento — `/api/v1/pontos-atendimento`

Mesmas 5 rotas. O create aceita `cooperativaId`. O GET `/` aceita query param `?cooperativaId=` para filtrar.

### Gerentes de Carteira — `/api/v1/gerentes-carteira`

Mesmas 5 rotas. O create aceita `pontoId`. O GET `/` aceita `?pontoId=` para filtrar.

### Indicadores — `/api/v1/indicadores`

Mesmas 5 rotas. Todos auth (reads) / adminOnly (writes).

### Metas — `/api/v1/metas`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| GET | `/` | auth | Listar (filtros: indicadorId, gerenteId, pontoId, cooperativaId) |
| GET | `/consolidado` | auth | Visão agregada consolidada (ver abaixo) |
| GET | `/:id` | auth | Buscar por id |
| POST | `/` | adminOnly | Criar meta |
| POST | `/lote` | adminOnly | Criar múltiplas metas de uma vez (todos os períodos de um ano) |
| PUT | `/:id` | adminOnly | Atualizar meta |
| DELETE | `/:id` | adminOnly | Excluir meta |
| PUT | `/:id/realizado` | adminOnly | Atualizar realizado manualmente |
| POST | `/importar-realizado` | adminOnly | Upload planilha Excel com realizados |

**IMPORTANTE:** Rotas com segmento literal (`/consolidado`, `/lote`, `/importar-realizado`) devem ser registradas **antes** de `/:id`.

---

## Endpoint `GET /api/v1/metas/consolidado`

Query params: `indicadorId` (obrigatório), `ano` (obrigatório), `periodo` (opcional — se omitido, retorna todos os períodos do ano), `cooperativaId` (opcional).

Resposta hierárquica (calculada no service, in-memory):

```json
{
  "indicador": {
    "id": "...",
    "nome": "Carteira de Crédito",
    "tipoMedicao": "contabil_decimal",
    "nivelBase": "gerente",
    "periodicidade": "mensal"
  },
  "ano": 2026,
  "periodo": 4,
  "cooperativas": [
    {
      "id": "...",
      "nome": "Sicoob Uberaba",
      "valorMeta": "10000000.00",
      "valorRealizado": "8500000.00",
      "pontosAtendimento": [
        {
          "id": "...",
          "nome": "PA Centro",
          "valorMeta": "5000000.00",
          "valorRealizado": "4200000.00",
          "gerentes": [
            {
              "id": "...",
              "nome": "João Silva",
              "valorMeta": "2000000.00",
              "valorRealizado": "1800000.00"
            }
          ]
        }
      ]
    }
  ]
}
```

Lógica de agregação no `MetasService.consolidado()`:
1. Buscar o indicador para conhecer `nivelBase` e `periodicidade`
2. Buscar cooperativas com joins `pontosAtendimento → gerentesCarteira` em uma query
3. Para cada entidade no nível folha, buscar metas correspondentes filtrando por `ano` + `periodo`
4. Somar `valorMeta` e `valorRealizado` para os níveis superiores com `Number()` em runtime (os campos chegam como string do Drizzle)

---

## Endpoint `POST /api/v1/metas/importar-realizado`

Aceita `multipart/form-data` com campo `file` (xlsx ou csv).

**Formato da planilha template (opção primária — por `meta_id`):**

| Coluna | Campo | Descrição |
|---|---|---|
| A | `meta_id` | UUID da meta (busca direta — mais confiável) |
| B | `valor_realizado` | Valor numérico (ponto como separador decimal) |

**Alternativa sem `meta_id` (lookup por composição):**

| Coluna | Campo |
|---|---|
| A | `entidade_id` |
| B | `indicador_slug` |
| C | `ano` |
| D | `periodo` |
| E | `valor_realizado` |

Lógica no service:
1. Ler buffer do arquivo com `XLSX.read(buffer, { type: "buffer" })`
2. Converter para JSON com `XLSX.utils.sheet_to_json()`
3. Para cada linha: encontrar a meta e fazer `db.update(metas).set({ valorRealizado, origemRealizado: "planilha" })`
4. Retornar `{ atualizadas: N, erros: [...] }`

---

## Regras de negócio no service de metas

### Função utilitária `calcularPeriodo(ano, periodo, periodicidade)`

Mapeamento de `(ano, periodo, periodicidade)` para `{ dataInicio, dataFim }`:

| Periodicidade | Range válido | Exemplo periodo=2 |
|---|---|---|
| `mensal` | 1–12 | Fevereiro |
| `bimestral` | 1–6 | Mar–Abr |
| `trimestral` | 1–4 | Q2 (Abr–Jun) |
| `semestral` | 1–2 | S2 (Jul–Dez) |
| `anual` | 1 | Ano inteiro |

Usado no consolidado e exposto na resposta para o frontend saber o intervalo real.

### Criação (`MetasService.create`)

1. Buscar indicador pelo `indicadorId` → verificar existência e obter `nivelBase` e `periodicidade`
2. Validar `periodo` dentro do range permitido pela `periodicidade`
3. Validar que o FK correto foi fornecido:
   - `nivelBase === "gerente"` → `gerenteId` obrigatório, `pontoId` e `cooperativaId` null
   - `nivelBase === "ponto"` → `pontoId` obrigatório, demais null
   - `nivelBase === "cooperativa"` → `cooperativaId` obrigatório, demais null
   - Retornar `status(422, "...")` se não bater
4. Inserir no banco — o unique index garante sem duplicata

### Criação em lote (`MetasService.createLote`)

Aceita array de metas. Para cada item, executa as mesmas validações. Retorna `{ criadas: N, erros: [...] }`. Útil para criar todos os períodos de um ano de uma vez (ex: 12 metas mensais para todos os gerentes de um ponto).

### Atualização de realizado (`MetasService.updateRealizado`)

Aceita apenas `{ valorRealizado: string }` + seta `origemRealizado = "manual"`.

---

## Arquivos a modificar/criar

| Arquivo | Operação |
|---|---|
| `api/src/db/schema/goals-schema.ts` | **Criar** |
| `api/src/db/schema/index.ts` | **Atualizar** — adicionar export e tabelas no schema |
| `api/src/http/controllers/metas/**` | **Criar** — 16 arquivos (5 recursos × model+service+controller + domain root) |
| `api/src/index.ts` | **Atualizar** — registrar metasController |

---

## Verificação (após implementação)

```bash
# 1. Gerar e aplicar migração
cd apps/api
bun run db:generate
bun run db:migrate

# 2. Iniciar API
bun run dev

# 3. Testar via OpenAPI em http://localhost:8080/reference
# Sequência mínima de teste:
#   POST /api/v1/cooperativas              → criar cooperativa
#   POST /api/v1/pontos-atendimento        → criar ponto (cooperativaId)
#   POST /api/v1/gerentes-carteira         → criar gerente (pontoId)
#   POST /api/v1/indicadores               → criar indicador (nivelBase: "gerente", periodicidade: "mensal")
#   POST /api/v1/metas                     → criar meta (gerenteId, indicadorId, ano, periodo, valorMeta)
#   PUT  /api/v1/metas/:id/realizado       → atualizar realizado manualmente
#   GET  /api/v1/metas/consolidado?indicadorId=...&ano=2026&periodo=4
#   POST /api/v1/metas/importar-realizado  → upload planilha
```
