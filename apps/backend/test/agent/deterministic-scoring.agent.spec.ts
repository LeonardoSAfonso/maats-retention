import { describe, expect, it, vi } from "vitest";
import {
  assertUUIDv7,
  BillingCycle,
  EngagementType,
  PaymentStatus,
  scenarios,
  SCORING_TIMEOUT_MS,
  SubscriptionStatus,
  type ScoringInput,
} from "@repo/contracts";
import { DeterministicScoringAgent } from "../../src/agent/scoring/deterministic-scoring.agent.js";

describe("DeterministicScoringAgent (Unit Tests)", () => {
  const agent = new DeterministicScoringAgent(0); // 0ms simulated latency for fast test runs

  describe("Seed Scenarios", () => {
    it.each(scenarios.filter((s) => !s.simulateTimeout))(
      "returns expectedRisk for $id",
      async (scenario) => {
        const input: ScoringInput = {
          subscriber: scenario.subscriber,
          subscription: scenario.subscription,
          plan: scenario.plan,
          engagementEvents: scenario.engagementEvents,
          paymentEvents: scenario.paymentEvents,
          rawReason: scenario.rawReason,
        };

        const result = await agent.score(input);

        expect(result.risk).toBe(scenario.expectedRisk);
        expect(result.timedOut).toBe(false);
        expect(result.rationale).toBe(scenario.description);
      },
    );

    it("simulates timeout by exceeding deadline for scenario-timeout", async () => {
      vi.useFakeTimers();
      const timeoutAgent = new DeterministicScoringAgent(0);
      const timeoutScenario = scenarios.find((s) => s.simulateTimeout);
      expect(timeoutScenario).toBeDefined();

      const input: ScoringInput = {
        subscriber: timeoutScenario!.subscriber,
        subscription: timeoutScenario!.subscription,
        plan: timeoutScenario!.plan,
        engagementEvents: timeoutScenario!.engagementEvents,
        paymentEvents: timeoutScenario!.paymentEvents,
        rawReason: timeoutScenario!.rawReason,
      };

      const scorePromise = timeoutAgent.score(input);

      // Advance timers beyond SCORING_TIMEOUT_MS
      await vi.advanceTimersByTimeAsync(SCORING_TIMEOUT_MS + 600);

      const result = await scorePromise;
      expect(result.timedOut).toBe(true);
      expect(result.risk).toBeUndefined();
      vi.useRealTimers();
    });
  });

  describe("Dynamic Heuristic Scoring for Unknown Subscriptions", () => {
    const subscriberId = assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e01");
    const subscriptionId = assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e02");
    const planId = assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e03");

    const defaultInput: ScoringInput = {
      subscriber: {
        id: subscriberId,
        name: "Test User",
        email: "test@example.com",
        createdAt: "2024-01-01T00:00:00Z",
      },
      subscription: {
        id: subscriptionId,
        subscriberId,
        planId,
        startedAt: "2024-01-01T00:00:00Z",
        status: SubscriptionStatus.ACTIVE,
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      plan: {
        id: planId,
        name: "Basic",
        priceCents: 2900,
        cycle: BillingCycle.MONTHLY,
        benefits: ["Full catalog"],
        createdAt: "2024-01-01T00:00:00Z",
      },
      engagementEvents: [],
      paymentEvents: [],
      rawReason: "Not using enough",
    };

    it("increases risk when failed and late payments are present", async () => {
      const highRiskInput: ScoringInput = {
        ...defaultInput,
        paymentEvents: [
          {
            id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e04"),
            subscriptionId: defaultInput.subscription.id,
            amountCents: 2900,
            status: PaymentStatus.FAILED,
            date: "2024-05-01T00:00:00Z",
            createdAt: "2024-05-01T00:00:00Z",
          },
          {
            id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e05"),
            subscriptionId: defaultInput.subscription.id,
            amountCents: 2900,
            status: PaymentStatus.LATE,
            date: "2024-06-01T00:00:00Z",
            createdAt: "2024-06-01T00:00:00Z",
          },
        ],
        engagementEvents: [],
      };

      const result = await agent.score(highRiskInput);
      expect(result.risk).toBeGreaterThan(0.7);
      expect(result.timedOut).toBe(false);
    });

    it("decreases risk when high engagement is present", async () => {
      const lowRiskInput: ScoringInput = {
        ...defaultInput,
        paymentEvents: [
          {
            id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e04"),
            subscriptionId: defaultInput.subscription.id,
            amountCents: 2900,
            status: PaymentStatus.ON_TIME,
            date: "2024-05-01T00:00:00Z",
            createdAt: "2024-05-01T00:00:00Z",
          },
        ],
        engagementEvents: [
          {
            id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e06"),
            subscriptionId: defaultInput.subscription.id,
            type: EngagementType.LOGIN,
            occurredAt: "2024-06-01T00:00:00Z",
            createdAt: "2024-06-01T00:00:00Z",
          },
          {
            id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e07"),
            subscriptionId: defaultInput.subscription.id,
            type: EngagementType.PLAYBACK,
            occurredAt: "2024-06-02T00:00:00Z",
            createdAt: "2024-06-02T00:00:00Z",
          },
          {
            id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e08"),
            subscriptionId: defaultInput.subscription.id,
            type: EngagementType.PLAYBACK,
            occurredAt: "2024-06-03T00:00:00Z",
            createdAt: "2024-06-03T00:00:00Z",
          },
        ],
      };

      const result = await agent.score(lowRiskInput);
      expect(result.risk).toBeLessThan(0.3);
      expect(result.timedOut).toBe(false);
    });
  });
});
