import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ReasonCategory } from "@repo/contracts";
import { ReasonKeywordRepository } from "../../src/reason-keyword/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCreateReasonKeywordDTO,
  mockPaginationParams,
  mockPrismaService,
  mockReasonKeywordData,
  mockUpdateReasonKeywordDTO,
} from "../mocks/utils.js";

describe("ReasonKeywordRepository", () => {
  let repository: ReasonKeywordRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReasonKeywordRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ReasonKeywordRepository>(ReasonKeywordRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new reason keyword", async () => {
      vi.spyOn(prismaService.reasonKeyword, "create").mockResolvedValue(mockReasonKeywordData);

      const result = await repository.create(mockCreateReasonKeywordDTO);

      expect(prismaService.reasonKeyword.create).toHaveBeenCalledWith({
        data: mockCreateReasonKeywordDTO,
      });
      expect(result).toEqual(mockReasonKeywordData);
    });
  });

  describe("find", () => {
    it("should return reason keywords with pagination", async () => {
      const mockKeywords = [mockReasonKeywordData];
      const mockCount = 1;

      vi.spyOn(prismaService.reasonKeyword, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.reasonKeyword, "findMany").mockResolvedValue(mockKeywords);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        reasonKeywords: mockKeywords,
      });
      expect(prismaService.reasonKeyword.count).toHaveBeenCalled();
      expect(prismaService.reasonKeyword.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a reason keyword by id", async () => {
      vi.spyOn(prismaService.reasonKeyword, "findUnique").mockResolvedValue(mockReasonKeywordData);

      const result = await repository.findById(mockReasonKeywordData.id);

      expect(prismaService.reasonKeyword.findUnique).toHaveBeenCalledWith({
        where: { id: mockReasonKeywordData.id },
      });
      expect(result).toEqual(mockReasonKeywordData);
    });

    it("should return null if keyword not found", async () => {
      vi.spyOn(prismaService.reasonKeyword, "findUnique").mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByTerm", () => {
    it("should return a reason keyword by term", async () => {
      vi.spyOn(prismaService.reasonKeyword, "findUnique").mockResolvedValue(mockReasonKeywordData);

      const result = await repository.findByTerm("expensive");

      expect(prismaService.reasonKeyword.findUnique).toHaveBeenCalledWith({
        where: { term: "expensive" },
      });
      expect(result).toEqual(mockReasonKeywordData);
    });
  });

  describe("findByCategory", () => {
    it("should return reason keywords by category", async () => {
      const mockKeywords = [mockReasonKeywordData];
      vi.spyOn(prismaService.reasonKeyword, "findMany").mockResolvedValue(mockKeywords);

      const result = await repository.findByCategory(ReasonCategory.PRICE);

      expect(prismaService.reasonKeyword.findMany).toHaveBeenCalledWith({
        where: { category: ReasonCategory.PRICE },
        orderBy: { term: "asc" },
      });
      expect(result).toEqual(mockKeywords);
    });
  });

  describe("findAll", () => {
    it("should return all reason keywords", async () => {
      const mockKeywords = [mockReasonKeywordData];
      vi.spyOn(prismaService.reasonKeyword, "findMany").mockResolvedValue(mockKeywords);

      const result = await repository.findAll();

      expect(prismaService.reasonKeyword.findMany).toHaveBeenCalledWith({
        orderBy: { term: "asc" },
      });
      expect(result).toEqual(mockKeywords);
    });
  });

  describe("update", () => {
    it("should update a reason keyword", async () => {
      const updated = { ...mockReasonKeywordData, ...mockUpdateReasonKeywordDTO };
      vi.spyOn(prismaService.reasonKeyword, "update").mockResolvedValue(updated);

      const result = await repository.update(mockReasonKeywordData.id, mockUpdateReasonKeywordDTO);

      expect(prismaService.reasonKeyword.update).toHaveBeenCalledWith({
        where: { id: mockReasonKeywordData.id },
        data: mockUpdateReasonKeywordDTO,
      });
      expect(result).toEqual(updated);
    });
  });

  describe("delete", () => {
    it("should delete a reason keyword", async () => {
      vi.spyOn(prismaService.reasonKeyword, "delete").mockResolvedValue(mockReasonKeywordData);

      const result = await repository.delete(mockReasonKeywordData.id);

      expect(prismaService.reasonKeyword.delete).toHaveBeenCalledWith({
        where: { id: mockReasonKeywordData.id },
      });
      expect(result).toEqual(mockReasonKeywordData);
    });
  });

  describe("upsert", () => {
    it("should upsert a reason keyword", async () => {
      vi.spyOn(prismaService.reasonKeyword, "upsert").mockResolvedValue(mockReasonKeywordData);

      const result = await repository.upsert(mockCreateReasonKeywordDTO);

      expect(prismaService.reasonKeyword.upsert).toHaveBeenCalledWith({
        where: { term: mockCreateReasonKeywordDTO.term },
        create: mockCreateReasonKeywordDTO,
        update: { category: mockCreateReasonKeywordDTO.category },
      });
      expect(result).toEqual(mockReasonKeywordData);
    });
  });

  describe("saveMany", () => {
    it("should upsert multiple keywords", async () => {
      const upsertSpy = vi.spyOn(repository, "upsert").mockResolvedValue(mockReasonKeywordData);

      await repository.saveMany([mockCreateReasonKeywordDTO]);

      expect(upsertSpy).toHaveBeenCalledWith(mockCreateReasonKeywordDTO);
    });
  });
});
