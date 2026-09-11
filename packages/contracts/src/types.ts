// UUID v7 (RFC 9562)
//
// Bit layout (128 bits total):
//   [0..47]    unix_ts_ms   - Unix timestamp in ms (48 bits)
//   [48..51]   ver          - Version, MUST be 0x7 = 0b0111 (4 bits)
//   [52..63]   rand_a       - Random (12 bits)
//   [64..65]   var          - Variant, MUST be 0b10 (2 bits)
//   [66..127]  rand_b       - Random (62 bits)
//
// Hex layout: XXXXXXXX-XXXX-7XXX-VXXX-XXXXXXXXXXXX
//   V ∈ { 8, 9, a, b }  - variant 0b10 means the top nibble is 8 to b
//
// Why a branded type instead of a template-literal type?
//   Template-literal validation of 32 hex positions creates 16^32 union
//   members, which exceeds TypeScript's representational limits.  The
//   branded-type + runtime-guard pattern is the industry standard (used by
//   zod, io-ts, effect/schema, typebox, etc.).

declare const UUIDv7Brand: unique symbol;

/**
 * Nominal (branded) UUID v7 - structurally `string`, but only assignable
 * when produced by `isUUIDv7()` / `assertUUIDv7()`.
 */
export type UUIDv7 = string & { readonly [UUIDv7Brand]: true };

// Bit-level regex.
// Matches every nibble:
//   • 8-4-4-4-12 lowercase hex groups separated by hyphens
//   • Version nibble (pos 13)  → `7`
//   • Variant nibble (pos 17)  → `8`|`9`|`a`|`b`  (bits 64-65 = 0b10)
//   • Case-insensitive  (/i) - uppercase hex normalised before branding.

const UUIDV7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Runtime guard - validates every nibble of a UUID v7. */
export function isUUIDv7(value: unknown): value is UUIDv7 {
  return typeof value === "string" && UUIDV7_RE.test(value);
}

/** Asserts `value` is a UUID v7 - throws TypeError on mismatch. */
export function assertUUIDv7(value: unknown): UUIDv7 {
  if (!isUUIDv7(value)) {
    throw new TypeError(`Expected UUIDv7, got ${JSON.stringify(value)}`);
  }
  return value;
}

// Legacy alias - prefer `UUIDv7` for new code.
export type UUID = UUIDv7;
export type ISO8601 = string;

export enum BillingCycle {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  CANCELLED = "CANCELLED",
  PAUSED = "PAUSED",
}

export enum EngagementType {
  LOGIN = "LOGIN",
  PLAYBACK = "PLAYBACK",
  DOWNLOAD = "DOWNLOAD",
  INTERACTION = "INTERACTION",
}

export enum PaymentStatus {
  ON_TIME = "ON_TIME",
  LATE = "LATE",
  FAILED = "FAILED",
}

export enum ReasonCategory {
  PRICE = "PRICE",
  LACK_OF_USE = "LACK_OF_USE",
  TECHNICAL_ISSUE = "TECHNICAL_ISSUE",
  COMPETITION = "COMPETITION",
  OTHER = "OTHER",
}

export enum RiskBand {
  LOW = "LOW",
  GREY = "GREY",
  HIGH = "HIGH",
}

export enum OfferType {
  DISCOUNT = "DISCOUNT",
  UPGRADE = "UPGRADE",
  PAUSE = "PAUSE",
}

export enum OfferStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
}

export enum OutcomeType {
  CANCELLED = "CANCELLED",
  AUTOMATIC_OFFER = "AUTOMATIC_OFFER",
  HUMAN_RETENTION = "HUMAN_RETENTION",
}

export interface Plan {
  id: UUID;
  name: string;
  priceCents: number;
  cycle: BillingCycle;
  benefits: string[];
  createdAt: ISO8601;
}

export interface Subscriber {
  id: UUID;
  name: string;
  email: string;
  createdAt: ISO8601;
}

export interface Subscription {
  id: UUID;
  subscriberId: UUID;
  planId: UUID;
  startedAt: ISO8601;
  status: SubscriptionStatus;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface EngagementEvent {
  id: UUID;
  subscriptionId: UUID;
  type: EngagementType;
  occurredAt: ISO8601;
  createdAt: ISO8601;
}

export interface PaymentEvent {
  id: UUID;
  subscriptionId: UUID;
  amountCents: number;
  status: PaymentStatus;
  date: ISO8601;
  createdAt: ISO8601;
}

export interface Offer {
  id: UUID;
  cancellationId: UUID;
  type: OfferType;
  amountCents?: number;
  status: OfferStatus;
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface CancellationOutcome {
  type: OutcomeType;
  offer?: Offer;
  humanReason?: string;
}

export interface Cancellation {
  id: UUID;
  subscriptionId: UUID;
  rawReason: string;
  reasonCategory?: ReasonCategory;
  risk?: number;
  band?: RiskBand;
  outcome?: CancellationOutcome; // optional: not yet determined when scoring is in progress or timed out without resolution
  createdAt: ISO8601;
  updatedAt: ISO8601;
}

export interface ScoringInput {
  subscriber: Subscriber;
  subscription: Subscription;
  plan: Plan;
  engagementEvents: EngagementEvent[];
  paymentEvents: PaymentEvent[];
  rawReason: string;
}

export interface ScoringResult {
  risk: number;
  rationale?: string;
  latencyMs: number;
  timedOut: boolean;
}

export interface ScoringAgent {
  score(input: ScoringInput): Promise<ScoringResult>;
}

export interface ClassificationInput {
  rawReason: string;
  subscription: Subscription;
}

export interface ClassificationResult {
  category: ReasonCategory;
  confidence: number;
  latencyMs: number;
}

export interface ClassificationAgent {
  classify(input: ClassificationInput): Promise<ClassificationResult>;
}

export interface CreateCancellationRequest {
  subscriptionId: UUID;
  rawReason: string;
}

export interface CreateCancellationResponse {
  cancellation: Cancellation;
}

export interface CancellationDetailResponse {
  cancellation: Cancellation;
  subscription: Subscription;
  subscriber: Subscriber;
  plan: Plan;
}

export interface SubscriptionListResponse {
  subscriptions: Array<{
    subscription: Subscription;
    subscriber: Subscriber;
    plan: Plan;
  }>;
}

export interface AcceptOfferRequest {
  cancellationId: UUID;
}

export interface DeclineOfferRequest {
  cancellationId: UUID;
}

export interface OfferActionResponse {
  offer: Offer;
  cancellation: Cancellation;
}

export interface MetricsResponse {
  totalCancellations: number;
  automaticCancellations: number;
  humanRetentions: number;
  avoidedCostCents: number;
  retentionRate: number;
  riskDistribution: Record<RiskBand, number>;
}

export const HUMAN_RETENTION_COST_CENTS = 1500;
export const LOW_RISK_THRESHOLD = 0.3; // risk < 0.30 → LOW; risk >= 0.30 → GREY or HIGH
export const HIGH_RISK_THRESHOLD = 0.7; // risk > 0.70 → HIGH; risk <= 0.70 → GREY or LOW
export const HIGH_VALUE_PERCENTILE = 0.2;
export const SCORING_TIMEOUT_MS = 3000; // if ScoringAgent does not respond within this deadline, treat as GREY (timeout fallback)
