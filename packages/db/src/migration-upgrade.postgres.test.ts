import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { afterAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.DATABASE_URL;
const describePostgres =
  process.env.VERIFY_DATABASE && databaseUrl ? describe.sequential : describe.skip;

/** First fork migration: everything before it is the pre-M3 (upstream) schema. */
const FIRST_FORK_MIGRATION = "20261004211000_space_main_bot";

const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../prisma/migrations",
);
const migrations = readdirSync(migrationsDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

function connectionTo(database: string) {
  const url = new URL(databaseUrl!);
  url.pathname = `/${database}`;
  return url.toString();
}

describePostgres("migration upgrade from a populated pre-M3 schema (PostgreSQL)", () => {
  const scratch = `upgrade_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
  let admin: pg.Client | undefined;
  let client: pg.Client | undefined;

  afterAll(async () => {
    await client?.end().catch(() => undefined);
    await admin?.query(`DROP DATABASE IF EXISTS "${scratch}" WITH (FORCE)`).catch(() => undefined);
    await admin?.end().catch(() => undefined);
  });

  async function apply(names: string[]) {
    for (const name of names) {
      const sql = readFileSync(path.join(migrationsDir, name, "migration.sql"), "utf8");
      try {
        await client!.query(sql);
      } catch (error) {
        throw new Error(`Migration ${name} failed: ${(error as Error).message}`);
      }
    }
  }

  /** Insert one row filling every required column without a default; FKs are bypassed. */
  async function seed(table: string, values: Record<string, unknown>) {
    const { rows } = await client!.query<{ column_name: string; data_type: string }>(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1
         AND is_nullable = 'NO' AND column_default IS NULL`,
      [table],
    );
    const row: Record<string, unknown> = { ...values };
    for (const { column_name, data_type } of rows) {
      if (column_name in row) continue;
      if (data_type === "boolean") row[column_name] = false;
      else if (data_type === "integer" || data_type === "bigint") row[column_name] = 0;
      else if (data_type === "double precision" || data_type === "numeric") row[column_name] = 0;
      else if (data_type === "jsonb" || data_type === "json") row[column_name] = "{}";
      else if (data_type.startsWith("timestamp")) row[column_name] = new Date();
      else if (data_type === "ARRAY") row[column_name] = "{}";
      else row[column_name] = `${table}-${column_name}`;
    }
    const columns = Object.keys(row);
    await client!.query(
      `INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(", ")})
       VALUES (${columns.map((_, index) => `$${index + 1}`).join(", ")})`,
      columns.map((column) => row[column]),
    );
  }

  it("keeps existing rows and adds the M3 schema", async () => {
    const cutoff = migrations.indexOf(FIRST_FORK_MIGRATION);
    expect(cutoff).toBeGreaterThan(0);

    admin = new pg.Client({ connectionString: databaseUrl });
    await admin.connect();
    await admin.query(`CREATE DATABASE "${scratch}"`);
    client = new pg.Client({ connectionString: connectionTo(scratch) });
    await client.connect();

    await apply(migrations.slice(0, cutoff));
    // Seed without foreign-key checks: the point is that populated rows survive the upgrade.
    await client.query("SET session_replication_role = replica");
    await seed("spaces", { id: "space-1", name: "Existing space" });
    await seed("bots", { id: "bot-1", spaceId: "space-1", name: "Existing bot" });
    await seed("threads", { id: "thread-1", spaceId: "space-1", botId: "bot-1" });
    await seed("messages", {
      id: "message-1",
      threadId: "thread-1",
      seq: 1,
      role: "user",
      blocks: JSON.stringify([{ kind: "text", text: "kept" }]),
    });
    await seed("tasks", { id: "task-1", spaceId: "space-1", botId: "bot-1", threadId: "thread-1" });
    await client.query("SET session_replication_role = DEFAULT");

    await apply(migrations.slice(cutoff));

    const bot = await client.query(`SELECT name FROM bots WHERE id = 'bot-1'`);
    expect(bot.rows).toEqual([{ name: "Existing bot" }]);
    const message = await client.query(`SELECT blocks FROM messages WHERE id = 'message-1'`);
    expect(message.rows[0]?.blocks).toEqual([{ kind: "text", text: "kept" }]);
    // The M3 additions exist and default to empty for pre-existing rows.
    const task = await client.query(`SELECT "projectId" FROM tasks WHERE id = 'task-1'`);
    expect(task.rows).toEqual([{ projectId: null }]);
    const projects = await client.query(`SELECT count(*)::int AS n FROM projects`);
    expect(projects.rows[0]?.n).toBe(0);
    const transcript = await client.query(
      `SELECT count(*)::int AS n FROM information_schema.columns
       WHERE table_name = 'artifacts' AND column_name = 'transcript'`,
    );
    expect(transcript.rows[0]?.n).toBe(1);
  });
});
