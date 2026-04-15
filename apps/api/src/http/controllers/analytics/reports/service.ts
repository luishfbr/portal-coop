import { status } from "elysia";
import { eq } from "drizzle-orm";
import { db, pool } from "@/db/client";
import { analyticsReports } from "@/db/schema";
import * as XLSX from "xlsx";

// ── Column Name Sanitization ──────────────────────────────────────────────────

function sanitizeColumnName(header: string): string {
  let name = header
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^(\d)/, "_$1");

  if (!name) name = "col_unnamed";
  return name.slice(0, 63);
}

// ── Type Inference ────────────────────────────────────────────────────────────

function inferColumnType(values: unknown[]): string {
  const nonEmpty = values
    .map((v) => (v === null || v === undefined ? "" : String(v).trim()))
    .filter((v) => v !== "");

  if (nonEmpty.length === 0) return "TEXT";

  const boolStrings = new Set([
    "true",
    "false",
    "yes",
    "no",
    "1",
    "0",
    "sim",
    "não",
    "nao",
  ]);
  if (nonEmpty.every((v) => boolStrings.has(v.toLowerCase()))) return "BOOLEAN";

  if (
    nonEmpty.every((v) => {
      const n = Number(v.replace(",", "."));
      return !isNaN(n) && isFinite(n) && Number.isInteger(n) && !v.includes(".");
    })
  )
    return "INTEGER";

  if (
    nonEmpty.every((v) => {
      const n = Number(v.replace(",", "."));
      return !isNaN(n) && isFinite(n);
    })
  )
    return "NUMERIC";

  if (
    nonEmpty.every((v) => {
      if (/^\d+$/.test(v)) return false;
      return !isNaN(Date.parse(v));
    })
  )
    return "TIMESTAMP";

  return "TEXT";
}

// ── File Parsing ──────────────────────────────────────────────────────────────

type ParsedFile = {
  headers: string[];
  rows: Record<string, unknown>[];
};

async function parseUploadedFile(file: File): Promise<ParsedFile> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });

  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
  });

  if (rows.length === 0) return { headers: [], rows: [] };

  const headers = Object.keys(rows[0]);
  return { headers, rows };
}

// ── Dynamic SQL Table Management ──────────────────────────────────────────────

type ColumnDef = { original: string; sanitized: string; type: string };

function buildColumnDefs(
  headers: string[],
  rows: Record<string, unknown>[]
): ColumnDef[] {
  const seen = new Map<string, number>();

  return headers.map((header) => {
    const values = rows.map((row) => row[header]);
    const sanitized = sanitizeColumnName(header);
    const count = seen.get(sanitized) ?? 0;
    seen.set(sanitized, count + 1);
    const finalName = count > 0 ? `${sanitized}_${count}` : sanitized;

    return {
      original: header,
      sanitized: finalName,
      type: inferColumnType(values),
    };
  });
}

async function ensureAnalyticsSchema(): Promise<void> {
  await pool.query("CREATE SCHEMA IF NOT EXISTS analytics");
}

async function recreateAnalyticsTable(
  slug: string,
  columnDefs: ColumnDef[],
  rows: Record<string, unknown>[]
): Promise<void> {
  await pool.query(`DROP TABLE IF EXISTS analytics.${slug}`);

  const colsSql = columnDefs
    .map((d) => `"${d.sanitized}" ${d.type}`)
    .join(", ");
  await pool.query(`CREATE TABLE analytics.${slug} (${colsSql})`);

  if (rows.length === 0) return;

  const BATCH_SIZE = 500;
  const colNames = columnDefs.map((d) => `"${d.sanitized}"`).join(", ");

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const colCount = columnDefs.length;

    const placeholders = batch
      .map(
        (_, rowIdx) =>
          `(${columnDefs
            .map((_, colIdx) => `$${rowIdx * colCount + colIdx + 1}`)
            .join(", ")})`
      )
      .join(", ");

    const flatValues = batch.flatMap((row) =>
      columnDefs.map((d) => {
        const v = row[d.original];
        return v === null || v === undefined ? null : String(v);
      })
    );

    await pool.query(
      `INSERT INTO analytics.${slug} (${colNames}) VALUES ${placeholders}`,
      flatValues
    );
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export abstract class ReportService {
  static findAll() {
    return db.query.analyticsReports.findMany();
  }

  static async findById(id: string) {
    const report = await db.query.analyticsReports.findFirst({
      where: eq(analyticsReports.id, id),
    });

    if (!report) return status(404, "Report not found");
    return report;
  }

  static async create(data: { name: string; slug: string; file: File }) {
    const existing = await db.query.analyticsReports.findFirst({
      where: eq(analyticsReports.slug, data.slug),
      columns: { id: true },
    });
    if (existing) return status(409, "A report with this slug already exists");

    const { headers, rows } = await parseUploadedFile(data.file);
    if (headers.length === 0)
      return status(422, "File is empty or has no headers");

    const columnDefs = buildColumnDefs(headers, rows);

    await ensureAnalyticsSchema();
    await recreateAnalyticsTable(data.slug, columnDefs, rows);

    const [report] = await db
      .insert(analyticsReports)
      .values({
        name: data.name,
        slug: data.slug,
        rowCount: rows.length,
        columnCount: headers.length,
      })
      .returning();

    return report;
  }

  static async update(id: string, data: { name?: string; file?: File }) {
    const existing = await db.query.analyticsReports.findFirst({
      where: eq(analyticsReports.id, id),
    });
    if (!existing) return status(404, "Report not found");

    let rowCount = existing.rowCount;
    let columnCount = existing.columnCount;

    if (data.file) {
      const { headers, rows } = await parseUploadedFile(data.file);
      if (headers.length === 0)
        return status(422, "File is empty or has no headers");

      const columnDefs = buildColumnDefs(headers, rows);

      await ensureAnalyticsSchema();
      await recreateAnalyticsTable(existing.slug, columnDefs, rows);

      rowCount = rows.length;
      columnCount = headers.length;
    }

    const [updated] = await db
      .update(analyticsReports)
      .set({ name: data.name ?? existing.name, rowCount, columnCount })
      .where(eq(analyticsReports.id, id))
      .returning();

    return updated;
  }

  static async remove(id: string) {
    const existing = await db.query.analyticsReports.findFirst({
      where: eq(analyticsReports.id, id),
      columns: { id: true, slug: true },
    });
    if (!existing) return status(404, "Report not found");

    await pool.query(`DROP TABLE IF EXISTS analytics.${existing.slug}`);
    await db.delete(analyticsReports).where(eq(analyticsReports.id, id));

    return { deleted: true };
  }
}
