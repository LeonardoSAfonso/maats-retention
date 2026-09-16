import { Inject, Injectable, Logger } from "@nestjs/common";
import type { Pool } from "pg";

import { DB_POOL } from "./db/db.module.js";

export interface HealthStatus {
  status: "ok";
  db: "up" | "down";
  checkedAt: string;
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject(DB_POOL) private readonly pool: Pool) {}

  async health(): Promise<HealthStatus> {
    let db: HealthStatus["db"] = "down";

    try {
      await this.pool.query("select 1");
      db = "up";
    } catch (error) {
      this.logger.warn(`Postgres indisponivel: ${String(error)}`);
    }

    return { status: "ok", db, checkedAt: new Date().toISOString() };
  }
}
