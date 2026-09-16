import { Test, type TestingModule } from "@nestjs/testing";
import { SubscriptionStatus } from "@repo/contracts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriptionRepository } from "../../src/subscription/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCreateSubscriptionDTO,
  mockPaginationParams,
  mockPrismaService,
  mockSubscriptionData,
} from "../mocks/utils.js";

describe("SubscriptionRepository", () => {
  let repository: SubscriptionRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<SubscriptionRepository>(SubscriptionRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new subscription", async () => {
      vi.spyOn(prismaService.subscription, "create").mockResolvedValue(mockSubscriptionData);

      const result = await repository.create(mockCreateSubscriptionDTO);

      expect(prismaService.subscription.create).toHaveBeenCalledWith({
        data: mockCreateSubscriptionDTO,
        include: {
          subscriber: true,
          plan: true,
        },
      });
      expect(result).toEqual(mockSubscriptionData);
    });
  });

  describe("find", () => {
    it("should return subscriptions with pagination", async () => {
      const mockSubscriptions = [mockSubscriptionData];
      const mockCount = 1;

      vi.spyOn(prismaService.subscription, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.subscription, "findMany").mockResolvedValue(mockSubscriptions);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        subscriptions: mockSubscriptions,
      });
      expect(prismaService.subscription.count).toHaveBeenCalled();
      expect(prismaService.subscription.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a subscription by id", async () => {
      vi.spyOn(prismaService.subscription, "findUnique").mockResolvedValue(mockSubscriptionData);

      const result = await repository.findById(mockSubscriptionData.id);

      expect(prismaService.subscription.findUnique).toHaveBeenCalledWith({
        where: { id: mockSubscriptionData.id },
        include: { subscriber: true, plan: true },
      });
      expect(result).toEqual(mockSubscriptionData);
    });
  });

  describe("findDetailById", () => {
    it("should return subscription detail with subscriber and plan", async () => {
      vi.spyOn(prismaService.subscription, "findUnique").mockResolvedValue(mockSubscriptionData);

      const result = await repository.findDetailById(mockSubscriptionData.id);

      expect(result).toEqual(mockSubscriptionData);
      expect(result?.subscriber.name).toBe("Ana Costa");
      expect(result?.plan.name).toBe("Basic");
    });
  });

  describe("updateStatus", () => {
    it("should update subscription status", async () => {
      const updated = {
        ...mockSubscriptionData,
        status: SubscriptionStatus.PAUSED,
      };
      vi.spyOn(prismaService.subscription, "update").mockResolvedValue(updated);

      const result = await repository.updateStatus(
        mockSubscriptionData.id,
        SubscriptionStatus.PAUSED,
      );

      expect(prismaService.subscription.update).toHaveBeenCalledWith({
        where: { id: mockSubscriptionData.id },
        data: { status: SubscriptionStatus.PAUSED },
        include: { subscriber: true, plan: true },
      });
      expect(result.status).toBe(SubscriptionStatus.PAUSED);
    });
  });

  describe("delete", () => {
    it("should delete a subscription", async () => {
      vi.spyOn(prismaService.subscription, "delete").mockResolvedValue(mockSubscriptionData);

      const result = await repository.delete(mockSubscriptionData.id);

      expect(prismaService.subscription.delete).toHaveBeenCalledWith({
        where: { id: mockSubscriptionData.id },
      });
      expect(result).toEqual(mockSubscriptionData);
    });
  });
});
