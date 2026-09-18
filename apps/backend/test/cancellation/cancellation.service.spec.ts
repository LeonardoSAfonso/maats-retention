import { BadRequestException, NotFoundException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  BillingCycle,
  OfferStatus,
  OfferType,
  OutcomeType,
  ReasonCategory,
  RiskBand,
  SubscriptionStatus,
  type UUID,
} from "@repo/contracts";
import { CancellationService } from "../../src/cancellation/cancellation.service.js";

describe("CancellationService (Unit Tests)", () => {
  let service: CancellationService;
  let mockScoringAgent: { score: ReturnType<typeof vi.fn> };
  let mockClassificationAgent: { classify: ReturnType<typeof vi.fn> };
  let mockCancellationRepository: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    getMetrics: ReturnType<typeof vi.fn>;
  };
  let mockSubscriptionRepository: {
    findById: ReturnType<typeof vi.fn>;
    updateStatus: ReturnType<typeof vi.fn>;
  };
  let mockPlanRepository: {
    findDistinctPriceCents: ReturnType<typeof vi.fn>;
  };
  let mockOfferRepository: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };
  let mockEventRepository: {
    findEngagementBySubscriptionId: ReturnType<typeof vi.fn>;
    findPaymentsBySubscriptionId: ReturnType<typeof vi.fn>;
  };

  const sampleSubscriber = {
    id: "0191ebc5-4e4a-7239-b353-a18517d74e01",
    name: "Ana Costa",
    email: "ana@exemplo.com",
    createdAt: new Date("2024-01-01T00:00:00Z"),
  };

  const samplePlanBasic = {
    id: "0191ebc5-4e4a-7239-b353-a18517d74e02",
    name: "Basic",
    priceCents: 2900,
    cycle: BillingCycle.MONTHLY,
    benefits: ["1 screen"],
    createdAt: new Date("2024-01-01T00:00:00Z"),
  };

  const samplePlanPremium = {
    id: "0191ebc5-4e4a-7239-b353-a18517d74e03",
    name: "Premium",
    priceCents: 19900,
    cycle: BillingCycle.MONTHLY,
    benefits: ["8 screens"],
    createdAt: new Date("2024-01-01T00:00:00Z"),
  };

  const sampleSubscription = {
    id: "0191ebc5-4e4a-7239-b353-a18517d74e04",
    subscriberId: sampleSubscriber.id,
    planId: samplePlanBasic.id,
    startedAt: new Date("2024-01-15T00:00:00Z"),
    status: SubscriptionStatus.ACTIVE,
    createdAt: new Date("2024-01-15T00:00:00Z"),
    updatedAt: new Date("2024-01-15T00:00:00Z"),
    subscriber: sampleSubscriber,
    plan: samplePlanBasic,
  };

  beforeEach(() => {
    mockScoringAgent = {
      score: vi.fn(),
    };
    mockClassificationAgent = {
      classify: vi.fn().mockResolvedValue({
        category: ReasonCategory.LACK_OF_USE,
        confidence: 0.95,
        latencyMs: 50,
      }),
    };
    mockCancellationRepository = {
      create: vi.fn().mockImplementation((data) => ({
        id: "0191ebc5-4e4a-7239-b353-a18517d74e05",
        createdAt: new Date(),
        updatedAt: new Date(),
        offers: [],
        ...data,
      })),
      findById: vi.fn(),
      getMetrics: vi.fn().mockResolvedValue({
        totalCancellations: 5,
        automaticCancellations: 2,
        humanRetentions: 3,
        avoidedCostCents: 3000,
        retentionRate: 0.4,
        riskDistribution: { [RiskBand.LOW]: 1, [RiskBand.GREY]: 2, [RiskBand.HIGH]: 2 },
      }),
    };
    mockSubscriptionRepository = {
      findById: vi.fn().mockResolvedValue(sampleSubscription),
      updateStatus: vi
        .fn()
        .mockResolvedValue({ ...sampleSubscription, status: SubscriptionStatus.CANCELLED }),
    };
    mockPlanRepository = {
      findDistinctPriceCents: vi.fn().mockResolvedValue([2900, 4900, 19900]),
    };
    mockOfferRepository = {
      create: vi.fn().mockImplementation((data) => ({
        id: "0191ebc5-4e4a-7239-b353-a18517d74e06",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      })),
      update: vi.fn().mockImplementation((id, data) => ({
        id,
        cancellationId: "0191ebc5-4e4a-7239-b353-a18517d74e05",
        type: OfferType.DISCOUNT,
        amountCents: 580,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      })),
    };
    mockEventRepository = {
      findEngagementBySubscriptionId: vi.fn().mockResolvedValue([]),
      findPaymentsBySubscriptionId: vi.fn().mockResolvedValue([]),
    };

    service = new CancellationService(
      mockScoringAgent as never,
      mockClassificationAgent as never,
      mockCancellationRepository as never,
      mockSubscriptionRepository as never,
      mockPlanRepository as never,
      mockOfferRepository as never,
      mockEventRepository as never,
    );
  });

  describe("processCancellation", () => {
    it("throws NotFoundException when subscription does not exist", async () => {
      mockSubscriptionRepository.findById.mockResolvedValue(null);

      await expect(
        service.processCancellation({
          subscriptionId: "non-existent-sub" as UUID,
          rawReason: "Reason",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("processes low risk scenario -> CANCELLED, updates subscription status to CANCELLED", async () => {
      mockScoringAgent.score.mockResolvedValue({
        risk: 0.15,
        rationale: "Long time subscriber",
        latencyMs: 100,
        timedOut: false,
      });

      const result = await service.processCancellation({
        subscriptionId: sampleSubscription.id as UUID,
        rawReason: "Not using enough",
      });

      expect(result.cancellation.band).toBe(RiskBand.LOW);
      expect(result.cancellation.outcome?.type).toBe(OutcomeType.CANCELLED);
      expect(mockSubscriptionRepository.updateStatus).toHaveBeenCalledWith(
        sampleSubscription.id,
        SubscriptionStatus.CANCELLED,
      );
      expect(mockOfferRepository.create).not.toHaveBeenCalled();
    });

    it("processes high risk scenario on normal plan -> AUTOMATIC_OFFER, creates pending discount offer", async () => {
      mockScoringAgent.score.mockResolvedValue({
        risk: 0.85,
        rationale: "High risk of churn",
        latencyMs: 150,
        timedOut: false,
      });

      const result = await service.processCancellation({
        subscriptionId: sampleSubscription.id as UUID,
        rawReason: "Too expensive",
      });

      expect(result.cancellation.band).toBe(RiskBand.HIGH);
      expect(result.cancellation.outcome?.type).toBe(OutcomeType.AUTOMATIC_OFFER);
      expect(mockOfferRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          cancellationId: expect.any(String),
          type: OfferType.DISCOUNT,
          status: OfferStatus.PENDING,
          amountCents: 580, // 20% of 2900
        }),
      );
      expect(mockSubscriptionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it("processes high risk scenario on premium plan (high value) -> intercepts to HUMAN_RETENTION", async () => {
      mockSubscriptionRepository.findById.mockResolvedValue({
        ...sampleSubscription,
        plan: samplePlanPremium,
      });

      mockScoringAgent.score.mockResolvedValue({
        risk: 0.8,
        rationale: "High risk on premium",
        latencyMs: 200,
        timedOut: false,
      });

      const result = await service.processCancellation({
        subscriptionId: sampleSubscription.id as UUID,
        rawReason: "No longer using premium",
      });

      expect(result.cancellation.band).toBe(RiskBand.HIGH);
      expect(result.cancellation.outcome?.type).toBe(OutcomeType.HUMAN_RETENTION);
      expect(result.cancellation.outcome?.humanReason).toBe("high recurring value at high risk");
      expect(mockOfferRepository.create).not.toHaveBeenCalled();
    });

    it("applies deadline race: falls back to GREY / HUMAN_RETENTION on scoring timeout", async () => {
      // Agent hangs longer than deadline
      mockScoringAgent.score.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 4000)),
      );

      vi.useFakeTimers();
      const promise = service.processCancellation({
        subscriptionId: sampleSubscription.id as UUID,
        rawReason: "I want to cancel now",
      });

      await vi.advanceTimersByTimeAsync(3100);
      const result = await promise;

      expect(result.cancellation.band).toBe(RiskBand.GREY);
      expect(result.cancellation.outcome?.type).toBe(OutcomeType.HUMAN_RETENTION);
      expect(result.cancellation.outcome?.humanReason).toBe("scoring agent timeout");
      expect(result.cancellation.risk).toBeUndefined();
      vi.useRealTimers();
    });

    it("does not abort cancellation when classification agent fails", async () => {
      mockScoringAgent.score.mockResolvedValue({
        risk: 0.15,
        rationale: "Low risk",
        latencyMs: 100,
        timedOut: false,
      });
      mockClassificationAgent.classify.mockRejectedValue(new Error("Network error"));

      const result = await service.processCancellation({
        subscriptionId: sampleSubscription.id as UUID,
        rawReason: "Reason with failed classifier",
      });

      expect(result.cancellation.band).toBe(RiskBand.LOW);
      expect(result.cancellation.reasonCategory).toBe(ReasonCategory.OTHER);
    });
  });

  describe("Offer Actions (accept & decline)", () => {
    it("accepts offer: updates offer to ACCEPTED and ensures subscription is ACTIVE", async () => {
      const mockCancellationWithOffer = {
        id: "cancellation-1",
        subscriptionId: sampleSubscription.id,
        rawReason: "Cost",
        createdAt: new Date(),
        updatedAt: new Date(),
        offers: [
          {
            id: "offer-1",
            cancellationId: "cancellation-1",
            type: OfferType.DISCOUNT,
            amountCents: 580,
            status: OfferStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockCancellationRepository.findById.mockResolvedValue(mockCancellationWithOffer);

      const result = await service.acceptOffer("cancellation-1");

      expect(result.offer.status).toBe(OfferStatus.ACCEPTED);
      expect(mockOfferRepository.update).toHaveBeenCalledWith("offer-1", {
        status: OfferStatus.ACCEPTED,
      });
      expect(mockSubscriptionRepository.updateStatus).toHaveBeenCalledWith(
        sampleSubscription.id,
        SubscriptionStatus.ACTIVE,
      );
    });

    it("declines offer: updates offer to DECLINED and sets subscription to CANCELLED", async () => {
      const mockCancellationWithOffer = {
        id: "cancellation-1",
        subscriptionId: sampleSubscription.id,
        rawReason: "Cost",
        createdAt: new Date(),
        updatedAt: new Date(),
        offers: [
          {
            id: "offer-1",
            cancellationId: "cancellation-1",
            type: OfferType.DISCOUNT,
            amountCents: 580,
            status: OfferStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      mockCancellationRepository.findById.mockResolvedValue(mockCancellationWithOffer);

      const result = await service.declineOffer("cancellation-1");

      expect(result.offer.status).toBe(OfferStatus.DECLINED);
      expect(mockOfferRepository.update).toHaveBeenCalledWith("offer-1", {
        status: OfferStatus.DECLINED,
      });
      expect(mockSubscriptionRepository.updateStatus).toHaveBeenCalledWith(
        sampleSubscription.id,
        SubscriptionStatus.CANCELLED,
      );
    });

    it("throws BadRequestException when no pending offer exists", async () => {
      const mockCancellationNoOffer = {
        id: "cancellation-1",
        subscriptionId: sampleSubscription.id,
        rawReason: "Cost",
        createdAt: new Date(),
        updatedAt: new Date(),
        offers: [],
      };
      mockCancellationRepository.findById.mockResolvedValue(mockCancellationNoOffer);

      await expect(service.acceptOffer("cancellation-1")).rejects.toThrow(BadRequestException);
    });
  });

  describe("getMetrics", () => {
    it("returns calculated metrics from repository", async () => {
      const metrics = await service.getMetrics();
      expect(metrics.totalCancellations).toBe(5);
      expect(metrics.avoidedCostCents).toBe(3000);
      expect(mockCancellationRepository.getMetrics).toHaveBeenCalled();
    });
  });
});
