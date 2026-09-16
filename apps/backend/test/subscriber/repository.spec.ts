import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubscriberRepository } from "../../src/subscriber/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCreateSubscriberDTO,
  mockPaginationParams,
  mockPrismaService,
  mockSubscriberData,
  mockUpdateSubscriberDTO,
} from "../mocks/utils.js";

describe("SubscriberRepository", () => {
  let repository: SubscriberRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriberRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<SubscriberRepository>(SubscriberRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new subscriber", async () => {
      vi.spyOn(prismaService.subscriber, "create").mockResolvedValue(mockSubscriberData);

      const result = await repository.create(mockCreateSubscriberDTO);

      expect(prismaService.subscriber.create).toHaveBeenCalledWith({
        data: mockCreateSubscriberDTO,
      });
      expect(result).toEqual(mockSubscriberData);
    });
  });

  describe("find", () => {
    it("should return subscribers with pagination", async () => {
      const mockSubscribers = [mockSubscriberData];
      const mockCount = 1;

      vi.spyOn(prismaService.subscriber, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.subscriber, "findMany").mockResolvedValue(mockSubscribers);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        subscribers: mockSubscribers,
      });
      expect(prismaService.subscriber.count).toHaveBeenCalled();
      expect(prismaService.subscriber.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a subscriber by id", async () => {
      vi.spyOn(prismaService.subscriber, "findUnique").mockResolvedValue(mockSubscriberData);

      const result = await repository.findById(mockSubscriberData.id);

      expect(prismaService.subscriber.findUnique).toHaveBeenCalledWith({
        where: { id: mockSubscriberData.id },
      });
      expect(result).toEqual(mockSubscriberData);
    });

    it("should return null if subscriber not found", async () => {
      vi.spyOn(prismaService.subscriber, "findUnique").mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByEmail", () => {
    it("should return a subscriber by email", async () => {
      vi.spyOn(prismaService.subscriber, "findUnique").mockResolvedValue(mockSubscriberData);

      const result = await repository.findByEmail("ana@exemplo.com");

      expect(prismaService.subscriber.findUnique).toHaveBeenCalledWith({
        where: { email: "ana@exemplo.com" },
      });
      expect(result).toEqual(mockSubscriberData);
    });
  });

  describe("update", () => {
    it("should update a subscriber", async () => {
      const updated = { ...mockSubscriberData, ...mockUpdateSubscriberDTO };
      vi.spyOn(prismaService.subscriber, "update").mockResolvedValue(updated);

      const result = await repository.update(mockSubscriberData.id, mockUpdateSubscriberDTO);

      expect(prismaService.subscriber.update).toHaveBeenCalledWith({
        where: { id: mockSubscriberData.id },
        data: mockUpdateSubscriberDTO,
      });
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should delete a subscriber", async () => {
      vi.spyOn(prismaService.subscriber, "delete").mockResolvedValue(mockSubscriberData);

      const result = await repository.delete(mockSubscriberData.id);

      expect(prismaService.subscriber.delete).toHaveBeenCalledWith({
        where: { id: mockSubscriberData.id },
      });
      expect(result).toEqual(mockSubscriberData);
    });
  });
});
