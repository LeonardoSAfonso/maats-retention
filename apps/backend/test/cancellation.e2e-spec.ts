import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import request from "supertest";
import type { App } from "supertest/types";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { OfferStatus, OutcomeType, RiskBand, scenarios } from "@repo/contracts";
import { AppModule } from "../src/app.module.js";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter.js";

describe("Cancellation E2E Flow", () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /subscriptions", () => {
    it("returns all active subscriptions with subscriber and plan details", async () => {
      const res = await request(app.getHttpServer()).get("/subscriptions").expect(200);

      expect(res.body).toHaveProperty("subscriptions");
      expect(Array.isArray(res.body.subscriptions)).toBe(true);
      expect(res.body.subscriptions.length).toBeGreaterThanOrEqual(7);

      const first = res.body.subscriptions[0];
      expect(first).toHaveProperty("subscription");
      expect(first).toHaveProperty("subscriber");
      expect(first).toHaveProperty("plan");
    });
  });

  describe("POST /cancellations (Core Scenarios)", () => {
    it("processes scenario-low -> LOW / CANCELLED", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-low")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.LOW);
      expect(res.body.cancellation.risk).toBe(0.15);
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.CANCELLED);
    });

    it("processes scenario-high -> HIGH / AUTOMATIC_OFFER with 20% discount offer", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-high")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.HIGH);
      expect(res.body.cancellation.risk).toBe(0.85);
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.AUTOMATIC_OFFER);
      expect(res.body.cancellation.outcome.offer).toBeDefined();
      expect(res.body.cancellation.outcome.offer.amountCents).toBe(580); // 20% of 2900
      expect(res.body.cancellation.outcome.offer.status).toBe(OfferStatus.PENDING);

      // Verify accept offer
      const acceptRes = await request(app.getHttpServer())
        .post(`/cancellations/${res.body.cancellation.id}/accept`)
        .expect(200);
      expect(acceptRes.body.offer.status).toBe(OfferStatus.ACCEPTED);
    });

    it("processes scenario-grey -> GREY / HUMAN_RETENTION (grey zone)", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-grey")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.GREY);
      expect(res.body.cancellation.risk).toBe(0.5);
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.HUMAN_RETENTION);
      expect(res.body.cancellation.outcome.humanReason).toBe("grey zone");
    });

    it("processes scenario-high-value-low -> LOW / CANCELLED (high value rule does not apply to low risk)", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-high-value-low")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.LOW);
      expect(res.body.cancellation.risk).toBe(0.1);
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.CANCELLED);
    });

    it("processes scenario-grey-high-value -> GREY / HUMAN_RETENTION (high value rule does not change grey zone)", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-grey-high-value")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.GREY);
      expect(res.body.cancellation.risk).toBe(0.55);
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.HUMAN_RETENTION);
      expect(res.body.cancellation.outcome.humanReason).toBe("grey zone");
    });

    it("processes scenario-high-value-high -> intercepted to HUMAN_RETENTION", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-high-value-high")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.HIGH);
      expect(res.body.cancellation.risk).toBe(0.8);
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.HUMAN_RETENTION);
      expect(res.body.cancellation.outcome.humanReason).toBe("high recurring value at high risk");
    });

    it("processes scenario-timeout -> falls back to GREY / HUMAN_RETENTION on deadline race", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-timeout")!;

      const res = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: scenario.rawReason,
        })
        .expect(201);

      expect(res.body.cancellation.band).toBe(RiskBand.GREY);
      expect(res.body.cancellation.risk).toBeUndefined();
      expect(res.body.cancellation.outcome.type).toBe(OutcomeType.HUMAN_RETENTION);
      expect(res.body.cancellation.outcome.humanReason).toBe("scoring agent timeout");
    }, 10000);
  });

  describe("GET /cancellations/:id and Offer Actions", () => {
    it("fetches cancellation details and handles decline offer", async () => {
      const scenario = scenarios.find((s) => s.id === "scenario-high")!;

      const createRes = await request(app.getHttpServer())
        .post("/cancellations")
        .send({
          subscriptionId: scenario.subscription.id,
          rawReason: "Quero cancelar agora",
        })
        .expect(201);

      const cancellationId = createRes.body.cancellation.id;

      // GET detail
      const detailRes = await request(app.getHttpServer())
        .get(`/cancellations/${cancellationId}`)
        .expect(200);

      expect(detailRes.body).toHaveProperty("cancellation");
      expect(detailRes.body).toHaveProperty("subscription");
      expect(detailRes.body).toHaveProperty("subscriber");
      expect(detailRes.body).toHaveProperty("plan");

      // Decline offer
      const declineRes = await request(app.getHttpServer())
        .post(`/cancellations/${cancellationId}/decline`)
        .expect(200);

      expect(declineRes.body.offer.status).toBe(OfferStatus.DECLINED);
    });
  });

  describe("GET /metrics", () => {
    it("returns metrics calculated from recorded cancellations", async () => {
      const res = await request(app.getHttpServer()).get("/metrics").expect(200);

      expect(res.body).toHaveProperty("totalCancellations");
      expect(res.body).toHaveProperty("automaticCancellations");
      expect(res.body).toHaveProperty("humanRetentions");
      expect(res.body).toHaveProperty("avoidedCostCents");
      expect(res.body).toHaveProperty("retentionRate");
      expect(res.body).toHaveProperty("riskDistribution");
      expect(res.body.totalCancellations).toBeGreaterThanOrEqual(1);
    });
  });
});
