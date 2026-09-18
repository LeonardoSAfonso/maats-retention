import {
  HIGH_RISK_THRESHOLD,
  HIGH_VALUE_PERCENTILE,
  LOW_RISK_THRESHOLD,
  OutcomeType,
  RiskBand,
} from "@repo/contracts";
import { type EvaluateDecisionInput, type RetentionDecision } from "./decision-engine.types.js";

export const DEFAULT_DISCOUNT_PERCENTAGE = 0.2;

export function isHighValuePrice(
  priceCents: number,
  distinctPricesAscending: number[],
  percentile: number = HIGH_VALUE_PERCENTILE,
): boolean {
  const n = distinctPricesAscending.length;
  if (n === 0) {
    return false;
  }

  const k = Math.ceil(percentile * n);
  const cutoffIndex = Math.max(0, n - k);
  const thresholdPrice = distinctPricesAscending[cutoffIndex];
  if (thresholdPrice === undefined) {
    return false;
  }

  return priceCents >= thresholdPrice;
}

/**
 * Calculates retention offer discount amount in cents based on plan price.
 */
export function calculateDiscountAmount(
  priceCents: number,
  discountPercentage: number = DEFAULT_DISCOUNT_PERCENTAGE,
): number {
  return Math.round(priceCents * discountPercentage);
}

/**
 * Pure decision rules engine for churn retention.
 * Completely isolated from HTTP, database, and frameworks.
 *
 * Decision rules:
 * - Timeout or undefined risk -> GREY, HUMAN_RETENTION, humanReason: "scoring agent timeout"
 * - risk < 0.30 -> LOW, CANCELLED
 * - 0.30 <= risk <= 0.70 -> GREY, HUMAN_RETENTION, humanReason: "grey zone"
 * - risk > 0.70 and high recurring value plan -> HIGH, HUMAN_RETENTION, humanReason: "high recurring value at high risk"
 * - risk > 0.70 and normal plan -> HIGH, AUTOMATIC_OFFER
 */
export function evaluateRetentionDecision(input: EvaluateDecisionInput): RetentionDecision {
  if (input.timedOut || input.risk === undefined || input.risk === null) {
    return {
      band: RiskBand.GREY,
      outcomeType: OutcomeType.HUMAN_RETENTION,
      humanReason: "scoring agent timeout",
    };
  }

  const { risk, isHighValuePlan } = input;

  if (risk < LOW_RISK_THRESHOLD) {
    return {
      band: RiskBand.LOW,
      outcomeType: OutcomeType.CANCELLED,
    };
  }

  if (risk <= HIGH_RISK_THRESHOLD) {
    return {
      band: RiskBand.GREY,
      outcomeType: OutcomeType.HUMAN_RETENTION,
      humanReason: "grey zone",
    };
  }

  if (isHighValuePlan) {
    return {
      band: RiskBand.HIGH,
      outcomeType: OutcomeType.HUMAN_RETENTION,
      humanReason: "high recurring value at high risk",
    };
  }

  return {
    band: RiskBand.HIGH,
    outcomeType: OutcomeType.AUTOMATIC_OFFER,
  };
}
