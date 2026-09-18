import { Test, type TestingModule } from "@nestjs/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PlanRepository } from "../../src/plan/repository.js";
import { PrismaService } from "../../src/orm/prisma.service.js";
import { PaginationParams } from "../../src/shared/types/pagination.type.js";
import {
  mockCreatePlanDTO,
  mockPaginationParams,
  mockPlanData,
  mockPrismaService,
  mockUpdatePlanDTO,
} from "../mocks/utils.js";

describe("PlanRepository", () => {
  let repository: PlanRepository;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PlanRepository>(PlanRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a new plan", async () => {
      vi.spyOn(prismaService.plan, "create").mockResolvedValue(mockPlanData);

      const result = await repository.create(mockCreatePlanDTO);

      expect(prismaService.plan.create).toHaveBeenCalledWith({
        data: mockCreatePlanDTO,
      });
      expect(result).toEqual(mockPlanData);
    });
  });

  describe("find", () => {
    it("should return plans with pagination", async () => {
      const mockPlans = [mockPlanData];
      const mockCount = 1;

      vi.spyOn(prismaService.plan, "count").mockResolvedValue(mockCount);
      vi.spyOn(prismaService.plan, "findMany").mockResolvedValue(mockPlans);

      const params = new PaginationParams(mockPaginationParams);
      const result = await repository.find(params);

      expect(result).toEqual({
        elements: mockCount,
        plans: mockPlans,
      });
      expect(prismaService.plan.count).toHaveBeenCalled();
      expect(prismaService.plan.findMany).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return a plan by id", async () => {
      vi.spyOn(prismaService.plan, "findUnique").mockResolvedValue(mockPlanData);

      const result = await repository.findById(mockPlanData.id);

      expect(prismaService.plan.findUnique).toHaveBeenCalledWith({
        where: { id: mockPlanData.id },
      });
      expect(result).toEqual(mockPlanData);
    });

    it("should return null if plan not found", async () => {
      vi.spyOn(prismaService.plan, "findUnique").mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a plan", async () => {
      const updatedPlan = { ...mockPlanData, ...mockUpdatePlanDTO };
      vi.spyOn(prismaService.plan, "update").mockResolvedValue(updatedPlan);

      const result = await repository.update(mockPlanData.id, mockUpdatePlanDTO);

      expect(prismaService.plan.update).toHaveBeenCalledWith({
        where: { id: mockPlanData.id },
        data: mockUpdatePlanDTO,
      });
      expect(result).toEqual(updatedPlan);
    });
  });

  describe("delete", () => {
    it("should delete a plan", async () => {
      vi.spyOn(prismaService.plan, "delete").mockResolvedValue(mockPlanData);

      const result = await repository.delete(mockPlanData.id);

      expect(prismaService.plan.delete).toHaveBeenCalledWith({
        where: { id: mockPlanData.id },
      });
      expect(result).toEqual(mockPlanData);
    });
  });

  describe("findDistinctPriceCents", () => {
    it("should return distinct priceCents in ascending order", async () => {
      vi.spyOn(prismaService.plan, "findMany").mockResolvedValue([
        { priceCents: 2900 } as { priceCents: number } as never,
        { priceCents: 4900 } as { priceCents: number } as never,
        { priceCents: 19900 } as { priceCents: number } as never,
      ]);

      const result = await repository.findDistinctPriceCents();

      expect(prismaService.plan.findMany).toHaveBeenCalledWith({
        select: { priceCents: true },
        distinct: ["priceCents"],
        orderBy: { priceCents: "asc" },
      });
      expect(result).toEqual([2900, 4900, 19900]);
    });
  });
});
