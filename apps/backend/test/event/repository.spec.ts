import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventRepository } from "../../src/event/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCreateEngagementEventDTO,
  mockCreatePaymentEventDTO,
  mockEngagementEventData,
  mockPaginationParams,
  mockPaymentEventData,
  mockPrismaService,
} from "../mocks/utils.js";

describe("EventRepository", () => {
  let repository: EventRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<EventRepository>(EventRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createEngagement", () => {
    it("should create an engagement event", async () => {
      vi.spyOn(prismaService.engagementEvent, "create").mockResolvedValue(mockEngagementEventData);

      const result = await repository.createEngagement(mockCreateEngagementEventDTO);

      expect(prismaService.engagementEvent.create).toHaveBeenCalledWith({
        data: mockCreateEngagementEventDTO,
      });
      expect(result).toEqual(mockEngagementEventData);
    });
  });

  describe("createPayment", () => {
    it("should create a payment event", async () => {
      vi.spyOn(prismaService.paymentEvent, "create").mockResolvedValue(mockPaymentEventData);

      const result = await repository.createPayment(mockCreatePaymentEventDTO);

      expect(prismaService.paymentEvent.create).toHaveBeenCalledWith({
        data: mockCreatePaymentEventDTO,
      });
      expect(result).toEqual(mockPaymentEventData);
    });
  });

  describe("findEngagement", () => {
    it("should return engagement events with pagination", async () => {
      const mockEvents = [mockEngagementEventData];
      const mockCount = 1;

      vi.spyOn(prismaService.engagementEvent, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.engagementEvent, "findMany").mockResolvedValue(mockEvents);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.findEngagement(params);

      expect(result).toEqual({
        elements: mockCount,
        events: mockEvents,
      });
      expect(prismaService.engagementEvent.count).toHaveBeenCalled();
      expect(prismaService.engagementEvent.findMany).toHaveBeenCalled();
    });
  });

  describe("findPayments", () => {
    it("should return payment events with pagination", async () => {
      const mockPayments = [mockPaymentEventData];
      const mockCount = 1;

      vi.spyOn(prismaService.paymentEvent, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.paymentEvent, "findMany").mockResolvedValue(mockPayments);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.findPayments(params);

      expect(result).toEqual({
        elements: mockCount,
        events: mockPayments,
      });
      expect(prismaService.paymentEvent.count).toHaveBeenCalled();
      expect(prismaService.paymentEvent.findMany).toHaveBeenCalled();
    });
  });

  describe("findEngagementBySubscriptionId", () => {
    it("should return engagement events for a subscription", async () => {
      vi.spyOn(prismaService.engagementEvent, "findMany").mockResolvedValue([
        mockEngagementEventData,
      ]);

      const result = await repository.findEngagementBySubscriptionId(
        mockEngagementEventData.subscriptionId,
      );

      expect(prismaService.engagementEvent.findMany).toHaveBeenCalledWith({
        where: { subscriptionId: mockEngagementEventData.subscriptionId },
        orderBy: { occurredAt: "asc" },
      });
      expect(result).toEqual([mockEngagementEventData]);
    });
  });

  describe("findPaymentsBySubscriptionId", () => {
    it("should return payment events for a subscription", async () => {
      vi.spyOn(prismaService.paymentEvent, "findMany").mockResolvedValue([mockPaymentEventData]);

      const result = await repository.findPaymentsBySubscriptionId(
        mockPaymentEventData.subscriptionId,
      );

      expect(prismaService.paymentEvent.findMany).toHaveBeenCalledWith({
        where: { subscriptionId: mockPaymentEventData.subscriptionId },
        orderBy: { date: "asc" },
      });
      expect(result).toEqual([mockPaymentEventData]);
    });
  });
});
