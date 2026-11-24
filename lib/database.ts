import { createClient, type Client, type InValue } from "@libsql/client";
let client: Client | undefined;
export function getClient() {
  if (!process.env.TURSO_DATABASE_URL) throw new Error("Turso DB 연결이 필요합니다.");
  return client ??= createClient({ url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN });
}
class Statement {
  constructor(readonly sql: string, readonly args: InValue[] = []) {}
  bind(...args: InValue[]) { return new Statement(this.sql, args); }
  async all<T>() { const result = await getClient().execute(this); return { results: result.rows as unknown as T[] }; }
  async first<T>() { return (await this.all<T>()).results[0] ?? null; }
  async run() { const result = await getClient().execute(this); return { meta: { changes: result.rowsAffected } }; }
}
export class Database {
  prepare(sql: string) { return new Statement(sql); }
  async batch(statements: Statement[]) { return getClient().batch(statements, "write"); }
}
export const database = new Database();
