import { describe, expect, it } from "vitest";
import { OutcomeType, RiskBand, scenarios } from "@repo/contracts";
import {
  calculateDiscountAmount,
  evaluateRetentionDecision,
  isHighValuePrice,
} from "../../src/decision/decision-engine.js";

describe("DecisionEngine (Unit Tests)", () => {
  const seedPrices = [2900, 4900, 19900]; // Basic, Standard, Premium

  describe("Seed Scenarios Conformity", () => {
    it.each(scenarios)(
      "correctly evaluates $id: $description",
      ({ plan, expectedRisk, expectedBand, expectedOutcome, simulateTimeout }) => {
        const isHighValue = isHighValuePrice(plan.priceCents, seedPrices);
        const decision = evaluateRetentionDecision({
          risk: expectedRisk,
          isHighValuePlan: isHighValue,
          timedOut: simulateTimeout,
        });

        expect(decision.band).toBe(expectedBand);
        expect(decision.outcomeType).toBe(expectedOutcome.type);
        if (expectedOutcome.humanReason) {
          expect(decision.humanReason).toBe(expectedOutcome.humanReason);
        } else {
          expect(decision.humanReason).toBeUndefined();
        }
      },
    );
  });

  describe("Boundary Conditions (< 0.30, [0.30, 0.70], > 0.70)", () => {
    it("classifies risk = 0.00 as LOW and CANCELLED", () => {
      const decision = evaluateRetentionDecision({ risk: 0.0, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.LOW,
        outcomeType: OutcomeType.CANCELLED,
      });
    });

    it("classifies risk = 0.2999 as LOW and CANCELLED", () => {
      const decision = evaluateRetentionDecision({ risk: 0.2999, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.LOW,
        outcomeType: OutcomeType.CANCELLED,
      });
    });

    it("classifies exact boundary risk = 0.30 as GREY and HUMAN_RETENTION", () => {
      const decision = evaluateRetentionDecision({ risk: 0.3, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "grey zone",
      });
    });

    it("classifies risk = 0.3001 as GREY and HUMAN_RETENTION", () => {
      const decision = evaluateRetentionDecision({ risk: 0.3001, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "grey zone",
      });
    });

    it("classifies risk = 0.50 as GREY and HUMAN_RETENTION", () => {
      const decision = evaluateRetentionDecision({ risk: 0.5, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "grey zone",
      });
    });

    it("classifies risk = 0.6999 as GREY and HUMAN_RETENTION", () => {
      const decision = evaluateRetentionDecision({ risk: 0.6999, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "grey zone",
      });
    });

    it("classifies exact boundary risk = 0.70 as GREY and HUMAN_RETENTION", () => {
      const decision = evaluateRetentionDecision({ risk: 0.7, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "grey zone",
      });
    });

    it("classifies risk = 0.7001 as HIGH and AUTOMATIC_OFFER for normal plan", () => {
      const decision = evaluateRetentionDecision({ risk: 0.7001, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.HIGH,
        outcomeType: OutcomeType.AUTOMATIC_OFFER,
      });
    });

    it("classifies risk = 1.00 as HIGH and AUTOMATIC_OFFER for normal plan", () => {
      const decision = evaluateRetentionDecision({ risk: 1.0, isHighValuePlan: false });
      expect(decision).toEqual({
        band: RiskBand.HIGH,
        outcomeType: OutcomeType.AUTOMATIC_OFFER,
      });
    });
  });

  describe("Secondary Rule: High Recurring Value Plan", () => {
    it("intercepts high risk to HUMAN_RETENTION with descriptive reason", () => {
      const decision = evaluateRetentionDecision({ risk: 0.85, isHighValuePlan: true });
      expect(decision).toEqual({
        band: RiskBand.HIGH,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "high recurring value at high risk",
      });
    });

    it("does NOT intercept low risk on high value plan (proceeds to CANCELLED)", () => {
      const decision = evaluateRetentionDecision({ risk: 0.15, isHighValuePlan: true });
      expect(decision).toEqual({
        band: RiskBand.LOW,
        outcomeType: OutcomeType.CANCELLED,
      });
    });

    it("does NOT alter grey zone on high value plan (remains grey zone)", () => {
      const decision = evaluateRetentionDecision({ risk: 0.55, isHighValuePlan: true });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "grey zone",
      });
    });
  });

  describe("Timeout and Undefined Risk Fallback", () => {
    it("falls back to GREY / HUMAN_RETENTION when timedOut is true", () => {
      const decision = evaluateRetentionDecision({
        timedOut: true,
        risk: undefined,
        isHighValuePlan: false,
      });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "scoring agent timeout",
      });
    });

    it("falls back to GREY / HUMAN_RETENTION when risk is undefined even if timedOut not explicitly set", () => {
      const decision = evaluateRetentionDecision({
        risk: undefined,
        isHighValuePlan: true,
      });
      expect(decision).toEqual({
        band: RiskBand.GREY,
        outcomeType: OutcomeType.HUMAN_RETENTION,
        humanReason: "scoring agent timeout",
      });
    });
  });

  describe("Dynamic High-Value Cutoff: isHighValuePrice", () => {
    it("returns false for empty list of prices", () => {
      expect(isHighValuePrice(1000, [])).toBe(false);
    });

    it("identifies top 20% for 3 seed prices [2900, 4900, 19900]: k = ceil(0.2 * 3) = 1", () => {
      const prices = [2900, 4900, 19900];
      expect(isHighValuePrice(2900, prices)).toBe(false);
      expect(isHighValuePrice(4900, prices)).toBe(false);
      expect(isHighValuePrice(19900, prices)).toBe(true);
    });

    it("identifies top 20% for 5 prices: k = ceil(0.2 * 5) = 1", () => {
      const prices = [1000, 2000, 3000, 4000, 5000];
      expect(isHighValuePrice(4000, prices)).toBe(false);
      expect(isHighValuePrice(5000, prices)).toBe(true);
    });

    it("identifies top 20% for 6 prices: k = ceil(0.2 * 6) = 2", () => {
      const prices = [1000, 2000, 3000, 4000, 5000, 6000];
      expect(isHighValuePrice(4000, prices)).toBe(false);
      expect(isHighValuePrice(5000, prices)).toBe(true);
      expect(isHighValuePrice(6000, prices)).toBe(true);
    });

    it("identifies top 20% for 1 single price: k = ceil(0.2 * 1) = 1", () => {
      const prices = [4900];
      expect(isHighValuePrice(4900, prices)).toBe(true);
    });
  });

  describe("Retention Offer Discount Calculation", () => {
    it("calculates 20% discount on plan prices correctly", () => {
      expect(calculateDiscountAmount(2900)).toBe(580);
      expect(calculateDiscountAmount(4900)).toBe(980);
      expect(calculateDiscountAmount(19900)).toBe(3980);
    });

    it("allows custom discount percentage", () => {
      expect(calculateDiscountAmount(10000, 0.3)).toBe(3000);
    });
  });
});
