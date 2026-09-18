import { vi } from "vitest";
import {
  BillingCycle,
  EngagementType,
  OfferStatus,
  OfferType,
  OutcomeType,
  PaymentStatus,
  ReasonCategory,
  RiskBand,
  SubscriptionStatus,
} from "@repo/contracts";
import type { PrismaService } from "../../src/orm/prisma.service.js";

export const mockPrismaService = {
  plan: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  subscriber: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  subscription: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  cancellation: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
  offer: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  engagementEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  paymentEvent: {
    create: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn(),
  },
  reasonKeyword: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    upsert: vi.fn(),
  },
} as unknown as PrismaService;

export const mockPlanData = {
  id: "01a08178-4e4a-7239-b353-a18517d74e88",
  name: "Basic",
  priceCents: 2900,
  cycle: BillingCycle.MONTHLY,
  benefits: ["1 screen", "full catalog"],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
};

export const mockCreatePlanDTO = {
  name: "Basic",
  priceCents: 2900,
  cycle: BillingCycle.MONTHLY,
  benefits: ["1 screen", "full catalog"],
};

export const mockUpdatePlanDTO = {
  priceCents: 3500,
};

export const mockSubscriberData = {
  id: "01a08178-4e4a-7239-b353-a762160cea9a",
  name: "Ana Costa",
  email: "ana@exemplo.com",
  createdAt: new Date("2024-01-10T00:00:00.000Z"),
};

export const mockCreateSubscriberDTO = {
  name: "Ana Costa",
  email: "ana@exemplo.com",
};

export const mockUpdateSubscriberDTO = {
  name: "Ana Costa Updated",
};

export const mockSubscriptionData = {
  id: "01a08178-4e4a-7239-b353-a8e451e04026",
  subscriberId: "01a08178-4e4a-7239-b353-a762160cea9a",
  planId: "01a08178-4e4a-7239-b353-a18517d74e88",
  startedAt: new Date("2024-01-15T00:00:00.000Z"),
  status: SubscriptionStatus.ACTIVE,
  createdAt: new Date("2024-01-15T00:00:00.000Z"),
  updatedAt: new Date("2026-06-15T00:00:00.000Z"),
  subscriber: mockSubscriberData,
  plan: mockPlanData,
};

export const mockCreateSubscriptionDTO = {
  subscriberId: "01a08178-4e4a-7239-b353-a762160cea9a",
  planId: "01a08178-4e4a-7239-b353-a18517d74e88",
  startedAt: "2024-01-15T00:00:00.000Z",
  status: SubscriptionStatus.ACTIVE,
};

export const mockUpdateSubscriptionDTO = {
  status: SubscriptionStatus.PAUSED,
};

export const mockCancellationData = {
  id: "01a08178-4e4a-7239-b353-a8e451e04027",
  subscriptionId: "01a08178-4e4a-7239-b353-a8e451e04026",
  rawReason: "Too expensive",
  reasonCategory: ReasonCategory.PRICE,
  risk: 0.85,
  band: RiskBand.HIGH,
  outcomeType: OutcomeType.AUTOMATIC_OFFER,
  humanReason: null,
  offers: [],
  createdAt: new Date("2026-06-15T00:00:00.000Z"),
  updatedAt: new Date("2026-06-15T00:00:00.000Z"),
};

export const mockCreateCancellationDTO = {
  subscriptionId: "01a08178-4e4a-7239-b353-a8e451e04026",
  rawReason: "Too expensive",
  reasonCategory: ReasonCategory.PRICE,
  risk: 0.85,
  band: RiskBand.HIGH,
  outcomeType: OutcomeType.AUTOMATIC_OFFER,
};

export const mockUpdateCancellationDTO = {
  risk: 0.9,
};

export const mockOfferData = {
  id: "01a08178-4e4a-7239-b353-a8e451e04028",
  cancellationId: "01a08178-4e4a-7239-b353-a8e451e04027",
  type: OfferType.DISCOUNT,
  amountCents: 580,
  status: OfferStatus.PENDING,
  createdAt: new Date("2026-06-15T00:00:00.000Z"),
  updatedAt: new Date("2026-06-15T00:00:00.000Z"),
};

export const mockCreateOfferDTO = {
  cancellationId: "01a08178-4e4a-7239-b353-a8e451e04027",
  type: OfferType.DISCOUNT,
  amountCents: 580,
};

export const mockUpdateOfferDTO = {
  status: OfferStatus.ACCEPTED,
};

export const mockEngagementEventData = {
  id: "01a08178-4e4a-7239-b353-a8e451e04029",
  subscriptionId: "01a08178-4e4a-7239-b353-a8e451e04026",
  type: EngagementType.LOGIN,
  occurredAt: new Date("2026-06-01T00:00:00.000Z"),
  createdAt: new Date("2026-06-01T00:00:00.000Z"),
};

export const mockPaymentEventData = {
  id: "01a08178-4e4a-7239-b353-a8e451e04030",
  subscriptionId: "01a08178-4e4a-7239-b353-a8e451e04026",
  amountCents: 2900,
  status: PaymentStatus.ON_TIME,
  date: new Date("2026-06-05T00:00:00.000Z"),
  createdAt: new Date("2026-06-05T00:00:00.000Z"),
};

export const mockCreateEngagementEventDTO = {
  subscriptionId: "01a08178-4e4a-7239-b353-a8e451e04026",
  type: EngagementType.LOGIN,
  occurredAt: "2026-06-01T00:00:00.000Z",
};

export const mockCreatePaymentEventDTO = {
  subscriptionId: "01a08178-4e4a-7239-b353-a8e451e04026",
  amountCents: 2900,
  status: PaymentStatus.ON_TIME,
  date: "2026-06-05T00:00:00.000Z",
};

export const mockReasonKeywordData = {
  id: "01a08178-4e4a-7239-b353-a8e451e04031",
  term: "expensive",
  category: ReasonCategory.PRICE,
  createdAt: new Date("2026-06-15T00:00:00.000Z"),
  updatedAt: new Date("2026-06-15T00:00:00.000Z"),
};

export const mockCreateReasonKeywordDTO = {
  term: "expensive",
  category: ReasonCategory.PRICE,
};

export const mockUpdateReasonKeywordDTO = {
  category: ReasonCategory.OTHER,
};

export const mockPaginationParams = {
  limit: 10,
  offset: 0,
  order: "asc" as const,
};
