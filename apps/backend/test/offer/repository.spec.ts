import { Test, type TestingModule } from "@nestjs/testing";
import { OfferStatus } from "@repo/contracts";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OfferRepository } from "../../src/offer/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCreateOfferDTO,
  mockOfferData,
  mockPaginationParams,
  mockPrismaService,
} from "../mocks/utils.js";

describe("OfferRepository", () => {
  let repository: OfferRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfferRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<OfferRepository>(OfferRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new offer", async () => {
      vi.spyOn(prismaService.offer, "create").mockResolvedValue(mockOfferData);

      const result = await repository.create(mockCreateOfferDTO);

      expect(prismaService.offer.create).toHaveBeenCalledWith({
        data: mockCreateOfferDTO,
      });
      expect(result).toEqual(mockOfferData);
    });
  });

  describe("find", () => {
    it("should return offers with pagination", async () => {
      const mockOffers = [mockOfferData];
      const mockCount = 1;

      vi.spyOn(prismaService.offer, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.offer, "findMany").mockResolvedValue(mockOffers);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        offers: mockOffers,
      });
      expect(prismaService.offer.count).toHaveBeenCalled();
      expect(prismaService.offer.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return an offer by id", async () => {
      vi.spyOn(prismaService.offer, "findUnique").mockResolvedValue(mockOfferData);

      const result = await repository.findById(mockOfferData.id);

      expect(prismaService.offer.findUnique).toHaveBeenCalledWith({
        where: { id: mockOfferData.id },
      });
      expect(result).toEqual(mockOfferData);
    });
  });

  describe("findByCancellationId", () => {
    it("should return an offer by cancellationId", async () => {
      vi.spyOn(prismaService.offer, "findFirst").mockResolvedValue(mockOfferData);

      const result = await repository.findByCancellationId(mockOfferData.cancellationId);

      expect(prismaService.offer.findFirst).toHaveBeenCalledWith({
        where: { cancellationId: mockOfferData.cancellationId },
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(mockOfferData);
    });
  });

  describe("updateStatus", () => {
    it("should update offer status", async () => {
      const updated = { ...mockOfferData, status: OfferStatus.ACCEPTED };
      vi.spyOn(prismaService.offer, "update").mockResolvedValue(updated);

      const result = await repository.updateStatus(mockOfferData.id, OfferStatus.ACCEPTED);

      expect(prismaService.offer.update).toHaveBeenCalledWith({
        where: { id: mockOfferData.id },
        data: { status: OfferStatus.ACCEPTED },
      });
      expect(result.status).toBe(OfferStatus.ACCEPTED);
    });
  });

  describe("delete", () => {
    it("should delete an offer", async () => {
      vi.spyOn(prismaService.offer, "delete").mockResolvedValue(mockOfferData);

      const result = await repository.delete(mockOfferData.id);

      expect(prismaService.offer.delete).toHaveBeenCalledWith({
        where: { id: mockOfferData.id },
      });
      expect(result).toEqual(mockOfferData);
    });
  });
});
