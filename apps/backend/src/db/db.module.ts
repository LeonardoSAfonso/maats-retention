import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Pool } from "pg";

export const DB_POOL = Symbol("DB_POOL");

/** O pool não impede o boot quando o banco está indisponível. */
const pool = new Pool({
  connectionString:
    process.env["DATABASE_URL"] ?? "postgres://postgres:postgres@localhost:5432/smart_retention",
  max: 10,
  connectionTimeoutMillis: 2000,
});

/** Pool de `pg` disponível por injeção de dependência. */
@Global()
@Module({
  providers: [{ provide: DB_POOL, useValue: pool }],
  exports: [DB_POOL],
})
export class DbModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await pool.end();
  }
}
