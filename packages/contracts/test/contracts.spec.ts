import { describe, expect, it } from "vitest";

import {
  HIGH_RISK_THRESHOLD,
  HIGH_VALUE_PERCENTILE,
  HUMAN_RETENTION_COST_CENTS,
  LOW_RISK_THRESHOLD,
  OutcomeType,
  RiskBand,
  SCORING_TIMEOUT_MS,
  plans,
  scenarios,
} from "../src/index.js";

/**
 * Este pacote define a especificação consumida pelos apps. Os testes fixam as
 * regras usadas na avaliação, então editar um limiar ou cenário quebra o
 * `pnpm verify`.
 */
describe("constantes de regra", () => {
  it("define as faixas e o fallback de timeout", () => {
    expect(LOW_RISK_THRESHOLD).toBe(0.3);
    expect(HIGH_RISK_THRESHOLD).toBe(0.7);
    expect(HIGH_VALUE_PERCENTILE).toBe(0.2);
    expect(SCORING_TIMEOUT_MS).toBe(3000);
    expect(HUMAN_RETENTION_COST_CENTS).toBe(1500);
  });
});

describe("planos do seed", () => {
  it("tem três planos distintos, e só o Premium é alto valor", () => {
    const prices = [...new Set(plans.map((plan) => plan.priceCents))].sort((a, b) => a - b);
    const k = Math.ceil(HIGH_VALUE_PERCENTILE * prices.length);
    const highValue = prices.slice(prices.length - k);

    expect(prices).toEqual([2900, 4900, 19900]);
    expect(k).toBe(1);
    expect(highValue).toEqual([19900]);
  });
});

describe("cenários", () => {
  const expected = [
    { id: "scenario-low", risk: 0.15, band: RiskBand.LOW, outcome: OutcomeType.CANCELLED },
    {
      id: "scenario-grey",
      risk: 0.5,
      band: RiskBand.GREY,
      outcome: OutcomeType.HUMAN_RETENTION,
      humanReason: "grey zone",
    },
    { id: "scenario-high", risk: 0.85, band: RiskBand.HIGH, outcome: OutcomeType.AUTOMATIC_OFFER },
    {
      id: "scenario-high-value-high",
      risk: 0.8,
      band: RiskBand.HIGH,
      outcome: OutcomeType.HUMAN_RETENTION,
      humanReason: "high recurring value at high risk",
    },
    {
      id: "scenario-timeout",
      risk: undefined,
      band: RiskBand.GREY,
      outcome: OutcomeType.HUMAN_RETENTION,
      humanReason: "scoring agent timeout",
      simulateTimeout: true,
    },
    {
      id: "scenario-high-value-low",
      risk: 0.1,
      band: RiskBand.LOW,
      outcome: OutcomeType.CANCELLED,
    },
    {
      id: "scenario-grey-high-value",
      risk: 0.55,
      band: RiskBand.GREY,
      outcome: OutcomeType.HUMAN_RETENTION,
      humanReason: "grey zone",
    },
  ];

  it("cobre os sete cenários do gabarito", () => {
    expect(scenarios.map((scenario) => scenario.id)).toEqual(expected.map((item) => item.id));
  });

  it.each(expected)("$id mantém risco, faixa e outcome esperados", (item) => {
    const scenario = scenarios.find((candidate) => candidate.id === item.id);

    expect(scenario).toBeDefined();
    expect(scenario?.expectedRisk).toBe(item.risk);
    expect(scenario?.expectedBand).toBe(item.band);
    expect(scenario?.expectedOutcome.type).toBe(item.outcome);
    if (item.humanReason) {
      expect(scenario?.expectedOutcome.humanReason).toBe(item.humanReason);
    }
    if (item.simulateTimeout) {
      expect(scenario?.simulateTimeout).toBe(true);
    }
  });

  it("liga cada evento e cada assinatura ao dono certo", () => {
    for (const scenario of scenarios) {
      expect(scenario.subscription.subscriberId).toBe(scenario.subscriber.id);
      expect(scenario.subscription.planId).toBe(scenario.plan.id);
      for (const event of [...scenario.engagementEvents, ...scenario.paymentEvents]) {
        expect(event.subscriptionId).toBe(scenario.subscription.id);
      }
    }
  });

  it("gera ids estáveis entre execuções", () => {
    const ids = scenarios.map((scenario) => scenario.subscription.id);
    const unique = new Set(ids);

    expect(unique.size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    }
  });
});
