import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Pool } from "pg";

export const DB_POOL = Symbol("DB_POOL");

/** Conexões abertas no boot, sem derrubar a aplicação se o banco estiver fora. */
const pool = new Pool({
  connectionString:
    process.env["DATABASE_URL"] ?? "postgres://postgres:postgres@localhost:5432/smart_retention",
  max: 10,
  connectionTimeoutMillis: 2000,
});

/**
 * Um `Pool` de `pg` disponível por injeção de dependência.
 *
 * O pool é criado de forma preguiçosa por natureza: nenhuma conexão é aberta
 * até a primeira query, então a aplicação sobe (e o `/health` responde) mesmo
 * com o Postgres parado.
 */
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
