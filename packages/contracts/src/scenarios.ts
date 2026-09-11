import {
  assertUUIDv7,
  BillingCycle,
  EngagementType,
  OfferStatus,
  OfferType,
  OutcomeType,
  PaymentStatus,
  RiskBand,
  SubscriptionStatus,
  type EngagementEvent,
  type PaymentEvent,
  type Plan,
  type Subscriber,
  type Subscription,
  type UUIDv7,
} from "./types.js";

export interface Scenario {
  id: string;
  description: string;
  subscriber: Subscriber;
  plan: Plan;
  subscription: Subscription;
  engagementEvents: EngagementEvent[];
  paymentEvents: PaymentEvent[];
  rawReason: string;
  expectedRisk?: number | undefined;
  expectedBand: RiskBand;
  expectedOutcome: { type: OutcomeType; humanReason?: string | undefined };
  simulateTimeout?: boolean | undefined;
}

// Each entity id comes from a stable FNV-1a seed. This keeps ids reproducible
// across runs while preserving valid RFC 9562 UUID v7s.

function fnv1a(seed: string, offset: number): number {
  let hash = (0x811c9dc5 ^ offset) >>> 0;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/** Returns an RFC 9562 UUID v7 derived deterministically from `seed`. */
function uuidv7(seed: string): UUIDv7 {
  const h0 = fnv1a(seed, 0x9e3779b9);
  const h1 = fnv1a(seed, 0x85ebca6b);
  const h2 = fnv1a(seed, 0xc2b2ae35);
  const h3 = fnv1a(seed, 0x27d4eb2f);
  const h4 = fnv1a(seed, 0x165667b1);
  const ts = (BigInt(h0) << 16n) | BigInt(h1 & 0xffff); // 48-bit timestamp
  const randA = h2 & 0xfff; // 12-bit rand_a
  const randB = ((BigInt(h3) << 32n) | BigInt(h4)) & ((1n << 62n) - 1n); // 62-bit rand_b
  const hex = (n: bigint, width: number) => n.toString(16).padStart(width, "0");
  return assertUUIDv7(
    `${hex(ts >> 16n, 8)}-${hex(ts & 0xffffn, 4)}-7${hex(BigInt(randA), 3)}-${hex(
      (0x8n << 12n) | (randB >> 48n),
      4,
    )}-${hex(randB & 0xffffffffffffn, 12)}`,
  );
}

export const basicPlan: Plan = {
  id: assertUUIDv7("01a08178-4e4a-7239-b353-a18517d74e88"),
  name: "Basic",
  priceCents: 2900,
  cycle: BillingCycle.MONTHLY,
  benefits: ["1 screen", "full catalog"],
  createdAt: "2024-01-01T00:00:00Z",
};

export const standardPlan: Plan = {
  id: assertUUIDv7("01a08178-4e4a-7239-b353-a762160cea9a"),
  name: "Standard",
  priceCents: 4900,
  cycle: BillingCycle.MONTHLY,
  benefits: ["4 screens", "full catalog", "offline"],
  createdAt: "2024-01-01T00:00:00Z",
};

export const premiumPlan: Plan = {
  id: assertUUIDv7("01a08178-4e4a-7239-b353-a8e451e04026"),
  name: "Premium",
  priceCents: 19900,
  cycle: BillingCycle.MONTHLY,
  benefits: ["8 screens", "full catalog", "offline", "4K HDR", "spatial audio"],
  createdAt: "2024-01-01T00:00:00Z",
};

export const plans: Plan[] = [basicPlan, standardPlan, premiumPlan];

interface ScenarioSeed {
  id: string;
  description: string;
  subscriber: { name: string; email: string; createdAt: string };
  plan: Plan;
  startedAt: string;
  updatedAt: string;
  engagement: Array<{ type: EngagementType; occurredAt: string }>;
  payments: Array<{ amountCents: number; status: PaymentStatus; date: string }>;
  rawReason: string;
  expectedRisk?: number | undefined;
  expectedBand: RiskBand;
  expectedOutcome: { type: OutcomeType; humanReason?: string | undefined };
  simulateTimeout?: boolean | undefined;
}

/** Builds a scenario and wires its subscription and event foreign keys. */
function makeScenario(seed: ScenarioSeed): Scenario {
  const subscriberId = uuidv7(`subscriber:${seed.id}`);
  const subscriptionId = uuidv7(`subscription:${seed.id}`);
  const subscriber: Subscriber = { id: subscriberId, ...seed.subscriber };
  const subscription: Subscription = {
    id: subscriptionId,
    subscriberId,
    planId: seed.plan.id,
    startedAt: seed.startedAt,
    status: SubscriptionStatus.ACTIVE,
    createdAt: seed.startedAt,
    updatedAt: seed.updatedAt,
  };
  const engagementEvents: EngagementEvent[] = seed.engagement.map((e, i) => ({
    id: uuidv7(`engagement:${seed.id}:${i}`),
    subscriptionId,
    type: e.type,
    occurredAt: e.occurredAt,
    createdAt: e.occurredAt,
  }));
  const paymentEvents: PaymentEvent[] = seed.payments.map((p, i) => ({
    id: uuidv7(`payment:${seed.id}:${i}`),
    subscriptionId,
    amountCents: p.amountCents,
    status: p.status,
    date: p.date,
    createdAt: p.date,
  }));
  return {
    id: seed.id,
    description: seed.description,
    subscriber,
    plan: seed.plan,
    subscription,
    engagementEvents,
    paymentEvents,
    rawReason: seed.rawReason,
    expectedRisk: seed.expectedRisk,
    expectedBand: seed.expectedBand,
    expectedOutcome: seed.expectedOutcome,
    simulateTimeout: seed.simulateTimeout,
  };
}

export const scenarios: Scenario[] = [
  makeScenario({
    id: "scenario-low",
    description:
      "Low risk: long-time subscriber, high engagement, payments on time. Should cancel directly.",
    subscriber: {
      name: "Ana Costa",
      email: "ana@exemplo.com",
      createdAt: "2024-01-10T00:00:00Z",
    },
    plan: basicPlan,
    startedAt: "2024-01-15T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
    engagement: [
      { type: EngagementType.LOGIN, occurredAt: "2026-06-01T00:00:00Z" },
      { type: EngagementType.PLAYBACK, occurredAt: "2026-06-10T00:00:00Z" },
      { type: EngagementType.PLAYBACK, occurredAt: "2026-06-15T00:00:00Z" },
    ],
    payments: [
      { amountCents: 2900, status: PaymentStatus.ON_TIME, date: "2026-05-15T00:00:00Z" },
      { amountCents: 2900, status: PaymentStatus.ON_TIME, date: "2026-06-15T00:00:00Z" },
    ],
    rawReason: "Will not use for a few months, but might come back.",
    expectedRisk: 0.15,
    expectedBand: RiskBand.LOW,
    expectedOutcome: { type: OutcomeType.CANCELLED },
  }),
  makeScenario({
    id: "scenario-grey",
    description: "Grey zone: mixed signals, one late payment. Should go to human retention.",
    subscriber: {
      name: "Bruno Lima",
      email: "bruno@exemplo.com",
      createdAt: "2025-12-01T00:00:00Z",
    },
    plan: standardPlan,
    startedAt: "2025-12-05T00:00:00Z",
    updatedAt: "2026-06-05T00:00:00Z",
    engagement: [
      { type: EngagementType.LOGIN, occurredAt: "2026-05-20T00:00:00Z" },
      { type: EngagementType.PLAYBACK, occurredAt: "2026-05-25T00:00:00Z" },
    ],
    payments: [
      { amountCents: 4900, status: PaymentStatus.ON_TIME, date: "2026-05-05T00:00:00Z" },
      { amountCents: 4900, status: PaymentStatus.LATE, date: "2026-06-05T00:00:00Z" },
    ],
    rawReason: "Evaluating whether it is worth continuing.",
    expectedRisk: 0.5,
    expectedBand: RiskBand.GREY,
    expectedOutcome: { type: OutcomeType.HUMAN_RETENTION, humanReason: "grey zone" },
  }),
  makeScenario({
    id: "scenario-high",
    description: "High risk, low-value plan: should receive an automatic retention offer.",
    subscriber: {
      name: "Carla Dias",
      email: "carla@exemplo.com",
      createdAt: "2026-04-01T00:00:00Z",
    },
    plan: basicPlan,
    startedAt: "2026-04-10T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
    engagement: [{ type: EngagementType.LOGIN, occurredAt: "2026-05-01T00:00:00Z" }],
    payments: [{ amountCents: 2900, status: PaymentStatus.FAILED, date: "2026-06-10T00:00:00Z" }],
    rawReason: "Too expensive for what it offers, I will cancel.",
    expectedRisk: 0.85,
    expectedBand: RiskBand.HIGH,
    expectedOutcome: { type: OutcomeType.AUTOMATIC_OFFER },
  }),
  makeScenario({
    id: "scenario-high-value-high",
    description:
      "High risk + premium plan (high value): the automatic offer is intercepted and goes to human retention.",
    subscriber: {
      name: "Diego Reis",
      email: "diego@exemplo.com",
      createdAt: "2026-03-01T00:00:00Z",
    },
    plan: premiumPlan,
    startedAt: "2026-03-10T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
    engagement: [{ type: EngagementType.LOGIN, occurredAt: "2026-04-15T00:00:00Z" }],
    payments: [{ amountCents: 19900, status: PaymentStatus.FAILED, date: "2026-06-10T00:00:00Z" }],
    rawReason: "No longer using the premium features.",
    expectedRisk: 0.8,
    expectedBand: RiskBand.HIGH,
    expectedOutcome: {
      type: OutcomeType.HUMAN_RETENTION,
      humanReason: "high recurring value at high risk",
    },
  }),
  makeScenario({
    id: "scenario-timeout",
    description: "Scoring Agent timeout: should fall back to grey zone and go to human retention.",
    subscriber: {
      name: "Eva Souza",
      email: "eva@exemplo.com",
      createdAt: "2025-06-01T00:00:00Z",
    },
    plan: standardPlan,
    startedAt: "2025-06-10T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
    engagement: [{ type: EngagementType.LOGIN, occurredAt: "2026-06-01T00:00:00Z" }],
    payments: [{ amountCents: 4900, status: PaymentStatus.ON_TIME, date: "2026-06-10T00:00:00Z" }],
    rawReason: "I want to cancel now.",
    expectedRisk: undefined,
    expectedBand: RiskBand.GREY,
    expectedOutcome: { type: OutcomeType.HUMAN_RETENTION, humanReason: "scoring agent timeout" },
    simulateTimeout: true,
  }),
  makeScenario({
    id: "scenario-high-value-low",
    description:
      "Edge case: low risk + premium plan (high value). The override does NOT apply to low risk - should cancel directly.",
    subscriber: {
      name: "Felipe Nunes",
      email: "felipe@exemplo.com",
      createdAt: "2023-01-01T00:00:00Z",
    },
    plan: premiumPlan,
    startedAt: "2023-02-01T00:00:00Z",
    updatedAt: "2026-06-15T00:00:00Z",
    engagement: [
      { type: EngagementType.LOGIN, occurredAt: "2026-06-05T00:00:00Z" },
      { type: EngagementType.PLAYBACK, occurredAt: "2026-06-12T00:00:00Z" },
      { type: EngagementType.DOWNLOAD, occurredAt: "2026-06-15T00:00:00Z" },
    ],
    payments: [
      { amountCents: 19900, status: PaymentStatus.ON_TIME, date: "2026-05-01T00:00:00Z" },
      { amountCents: 19900, status: PaymentStatus.ON_TIME, date: "2026-06-01T00:00:00Z" },
    ],
    rawReason: "Will be traveling for a few months without access.",
    expectedRisk: 0.1,
    expectedBand: RiskBand.LOW,
    expectedOutcome: { type: OutcomeType.CANCELLED },
  }),
  makeScenario({
    id: "scenario-grey-high-value",
    description:
      "Edge case: grey zone + premium plan (high value). The high-value override only applies to HIGH risk, so grey zone goes to human retention regardless - same as normal grey zone.",
    subscriber: {
      name: "Gabriela Mendes",
      email: "gabriela@exemplo.com",
      createdAt: "2025-09-01T00:00:00Z",
    },
    plan: premiumPlan,
    startedAt: "2025-09-10T00:00:00Z",
    updatedAt: "2026-06-10T00:00:00Z",
    engagement: [
      { type: EngagementType.LOGIN, occurredAt: "2026-05-15T00:00:00Z" },
      { type: EngagementType.PLAYBACK, occurredAt: "2026-06-01T00:00:00Z" },
    ],
    payments: [
      { amountCents: 19900, status: PaymentStatus.ON_TIME, date: "2026-05-10T00:00:00Z" },
      { amountCents: 19900, status: PaymentStatus.LATE, date: "2026-06-10T00:00:00Z" },
    ],
    rawReason: "Not sure if the premium features are worth the price anymore.",
    expectedRisk: 0.55,
    expectedBand: RiskBand.GREY,
    expectedOutcome: { type: OutcomeType.HUMAN_RETENTION, humanReason: "grey zone" },
  }),
];

export const subscribers: Subscriber[] = scenarios.map((s) => s.subscriber);
export const subscriptions: Subscription[] = scenarios.map((s) => s.subscription);
export const engagementEvents: EngagementEvent[] = scenarios.flatMap((s) => s.engagementEvents);
export const paymentEvents: PaymentEvent[] = scenarios.flatMap((s) => s.paymentEvents);

export const DEFAULT_OFFER_TYPE = OfferType.DISCOUNT;
export const INITIAL_OFFER_STATUS = OfferStatus.PENDING;
