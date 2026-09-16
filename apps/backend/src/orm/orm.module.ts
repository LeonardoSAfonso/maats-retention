import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Pool } from "pg";
import { PrismaService } from "./prisma.service.js";

export const DB_POOL = Symbol("DB_POOL");

const pool = new Pool({
  connectionString:
    process.env["DATABASE_URL"] ?? "postgres://postgres:postgres@localhost:5432/smart_retention",
  max: 10,
  connectionTimeoutMillis: 2000,
});

@Global()
@Module({
  providers: [PrismaService, { provide: DB_POOL, useValue: pool }],
  exports: [PrismaService, DB_POOL],
})
export class OrmModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await pool.end();
  }
}

export default OrmModule;
