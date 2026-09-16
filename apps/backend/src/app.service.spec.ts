import { Test, type TestingModule } from "@nestjs/testing";

import { AppService } from "./app.service";
import { DB_POOL } from "./db/db.module.js";

describe("AppService.health", () => {
  async function createService(query: () => Promise<unknown>): Promise<AppService> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService, { provide: DB_POOL, useValue: { query } }],
    }).compile();

    return module.get(AppService);
  }

  it("reporta db up quando o pool responde", async () => {
    const service = await createService(() => Promise.resolve({ rows: [] }));

    await expect(service.health()).resolves.toMatchObject({ status: "ok", db: "up" });
  });

  it("reporta db down quando o pool falha, sem derrubar a aplicacao", async () => {
    const service = await createService(() => Promise.reject(new Error("ECONNREFUSED")));

    await expect(service.health()).resolves.toMatchObject({ status: "ok", db: "down" });
  });
});
