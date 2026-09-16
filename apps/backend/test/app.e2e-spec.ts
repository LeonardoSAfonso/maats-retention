import type { INestApplication } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";

import { AppModule } from "../src/app.module.js";
import { DB_POOL } from "../src/db/db.module.js";

describe("GET /health (e2e)", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // O teste substitui o pool, então não precisa de um Postgres real.
      .overrideProvider(DB_POOL)
      .useValue({ query: () => Promise.resolve({ rows: [] }) })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("responde ok com o banco acessivel", async () => {
    const response = await request(app.getHttpServer()).get("/health").expect(200);

    expect(response.body).toMatchObject({ status: "ok", db: "up" });
  });
});
