import { randomUUIDv7 } from "bun";
import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { sectors } from "./organizational-schema";

export const indicatorCategoria = pgEnum("indicator_categoria", [
  "planejamento_estrategico",
  "metas_comerciais",
  "pacto_sistemico",
  "orcamento",
]);

export const indicatorDirecao = pgEnum("indicator_direcao", [
  "crescente",
  "decrescente",
]);

export const indicatorPeriodicidade = pgEnum("indicator_periodicidade", [
  "mensal",
  "bimestral",
  "trimestral",
  "semestral",
  "anual",
]);

export const indicatorMetodoConsolidacao = pgEnum(
  "indicator_metodo_consolidacao",
  ["acumulado", "movimentacao_no_periodo"],
);

export const indicatorUnidadeMedida = pgEnum("indicator_unidade_medida", [
  "inteiro",
  "percentual",
  "contabil",
]);

export const indicatorValueType = pgEnum("indicator_value_type", [
  "realizado",
  "meta",
]);

export const indicators = pgTable(
  "indicators",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    sectorId: text("sector_id").references(() => sectors.id, {
      onDelete: "set null",
    }),
    categoria: indicatorCategoria("categoria").notNull(),
    direcao: indicatorDirecao("direcao").notNull(),
    periodicidade: indicatorPeriodicidade("periodicidade").notNull(),
    defasagem: integer("defasagem").notNull().default(0),
    metodoConsolidacao: indicatorMetodoConsolidacao(
      "metodo_consolidacao",
    ).notNull(),
    unidadeMedida: indicatorUnidadeMedida("unidade_medida").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("uq_indicators_slug").on(table.slug),
    index("idx_indicators_sector_id").on(table.sectorId),
  ],
);

export const indicatorValues = pgTable(
  "indicator_values",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUIDv7()),
    indicatorId: text("indicator_id")
      .notNull()
      .references(() => indicators.id, { onDelete: "cascade" }),
    type: indicatorValueType("type").notNull(),
    value: numeric("value", { precision: 15, scale: 4 }).notNull(),
    referenceDate: date("reference_date").notNull(),
    createdAt: timestamp("created_at")
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: timestamp("updated_at")
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_indicator_values_indicator_id").on(table.indicatorId),
    index("idx_indicator_values_reference_date").on(table.referenceDate),
    uniqueIndex("uq_indicator_values_type_date").on(
      table.indicatorId,
      table.type,
      table.referenceDate,
    ),
  ],
);

export const indicatorsRelations = relations(indicators, ({ one, many }) => ({
  sector: one(sectors, {
    fields: [indicators.sectorId],
    references: [sectors.id],
  }),
  values: many(indicatorValues),
}));

export const indicatorValuesRelations = relations(
  indicatorValues,
  ({ one }) => ({
    indicator: one(indicators, {
      fields: [indicatorValues.indicatorId],
      references: [indicators.id],
    }),
  }),
);
