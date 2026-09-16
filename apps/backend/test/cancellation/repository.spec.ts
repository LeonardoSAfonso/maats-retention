import { Test, type TestingModule } from "@nestjs/testing";
import type { Cancellation, Offer } from "@prisma/client";
import { OfferStatus, OutcomeType, RiskBand } from "@repo/contracts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CancellationRepository } from "../../src/cancellation/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCancellationData,
  mockCreateCancellationDTO,
  mockPaginationParams,
  mockPrismaService,
  mockUpdateCancellationDTO,
} from "../mocks/utils.js";

describe("CancellationRepository", () => {
  let repository: CancellationRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancellationRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<CancellationRepository>(CancellationRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new cancellation", async () => {
      vi.spyOn(prismaService.cancellation, "create").mockResolvedValue(mockCancellationData);

      const result = await repository.create(mockCreateCancellationDTO);

      expect(prismaService.cancellation.create).toHaveBeenCalledWith({
        data: mockCreateCancellationDTO,
        include: { offers: true },
      });
      expect(result).toEqual(mockCancellationData);
    });
  });

  describe("find", () => {
    it("should return cancellations with pagination", async () => {
      const mockCancellations = [mockCancellationData];
      const mockCount = 1;

      vi.spyOn(prismaService.cancellation, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.cancellation, "findMany").mockResolvedValue(mockCancellations);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        cancellations: mockCancellations,
      });
      expect(prismaService.cancellation.count).toHaveBeenCalled();
      expect(prismaService.cancellation.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a cancellation by id", async () => {
      vi.spyOn(prismaService.cancellation, "findUnique").mockResolvedValue(mockCancellationData);

      const result = await repository.findById(mockCancellationData.id);

      expect(prismaService.cancellation.findUnique).toHaveBeenCalledWith({
        where: { id: mockCancellationData.id },
        include: { offers: true },
      });
      expect(result).toEqual(mockCancellationData);
    });
  });

  describe("findBySubscriptionId", () => {
    it("should return a cancellation by subscriptionId", async () => {
      vi.spyOn(prismaService.cancellation, "findFirst").mockResolvedValue(mockCancellationData);

      const result = await repository.findBySubscriptionId(mockCancellationData.subscriptionId);

      expect(prismaService.cancellation.findFirst).toHaveBeenCalledWith({
        where: { subscriptionId: mockCancellationData.subscriptionId },
        include: { offers: true },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockCancellationData);
    });
  });

  describe("update", () => {
    it("should update a cancellation", async () => {
      const updated = { ...mockCancellationData, ...mockUpdateCancellationDTO };
      vi.spyOn(prismaService.cancellation, "update").mockResolvedValue(updated);

      const result = await repository.update(mockCancellationData.id, mockUpdateCancellationDTO);

      expect(prismaService.cancellation.update).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should delete a cancellation", async () => {
      vi.spyOn(prismaService.cancellation, "delete").mockResolvedValue(mockCancellationData);

      const result = await repository.delete(mockCancellationData.id);

      expect(prismaService.cancellation.delete).toHaveBeenCalledWith({
        where: { id: mockCancellationData.id },
      });
      expect(result).toEqual(mockCancellationData);
    });
  });

  describe("getMetrics", () => {
    it("should calculate business metrics correctly", async () => {
      vi.spyOn(prismaService.cancellation, "findMany").mockResolvedValue([
        {
          id: "1",
          subscriptionId: "sub-1",
          rawReason: "Reason 1",
          band: RiskBand.LOW,
          outcomeType: OutcomeType.CANCELLED,
          offers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          reasonCategory: null,
          risk: 0.15,
          humanReason: null,
        },
        {
          id: "2",
          subscriptionId: "sub-2",
          rawReason: "Reason 2",
          band: RiskBand.GREY,
          outcomeType: OutcomeType.HUMAN_RETENTION,
          offers: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          reasonCategory: null,
          risk: 0.5,
          humanReason: "grey zone",
        },
        {
          id: "3",
          subscriptionId: "sub-3",
          rawReason: "Reason 3",
          band: RiskBand.HIGH,
          outcomeType: OutcomeType.AUTOMATIC_OFFER,
          offers: [
            {
              id: "off-1",
              cancellationId: "3",
              type: "DISCOUNT",
              amountCents: 580,
              status: OfferStatus.ACCEPTED,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
          reasonCategory: null,
          risk: 0.85,
          humanReason: null,
        },
      ] as unknown as Array<Cancellation & { offers: Offer[] }>);

      const metrics = await repository.getMetrics();

      expect(metrics.totalCancellations).toBe(3);
      expect(metrics.humanRetentions).toBe(1);
      expect(metrics.automaticCancellations).toBe(2);
      expect(metrics.avoidedCostCents).toBe((3 - 1) * 1500); // 3000
      expect(metrics.retentionRate).toBeCloseTo(2 / 3);
      expect(metrics.riskDistribution[RiskBand.LOW]).toBe(1);
      expect(metrics.riskDistribution[RiskBand.GREY]).toBe(1);
      expect(metrics.riskDistribution[RiskBand.HIGH]).toBe(1);
    });
  });
});
