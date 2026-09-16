import { describe, expect, it } from "vitest";
import { BadRequestException } from "@nestjs/common";
import { CustomQuery, validateQueryFields } from "../../../src/shared/types/customQuery.type.js";
import { PaginationParams } from "../../../src/shared/types/pagination.type.js";
import { getTotalPage } from "../../../src/shared/utils/totalPage.js";

describe("CustomQuery and Pagination", () => {
  describe("validateQueryFields", () => {
    it("should return true for valid fields on Plan", () => {
      expect(validateQueryFields("Plan", "name")).toBe(true);
      expect(validateQueryFields("Plan", "priceCents")).toBe(true);
      expect(validateQueryFields("Plan", "cycle")).toBe(true);
    });

    it("should return false for invalid fields", () => {
      expect(validateQueryFields("Plan", "nonExistentField")).toBe(false);
    });
  });

  describe("CustomQuery.fromPagination", () => {
    it("should build query with pagination limit and offset", () => {
      const params = new PaginationParams({
        limit: 20,
        offset: 10,
        order: "desc",
      });

      const query = CustomQuery.fromPagination(params, "Plan");

      expect(query.take).toBe(20);
      expect(query.skip).toBe(10);
    });

    it("should build orderBy when valid field is passed", () => {
      const params = new PaginationParams({
        orderBy: "name",
        order: "asc",
      });

      const query = CustomQuery.fromPagination(params, "Plan");

      expect(query.orderBy).toEqual({ name: "asc" });
    });

    it("should throw BadRequestException when invalid orderBy field is passed", () => {
      const params = new PaginationParams({
        orderBy: "invalidField",
      });

      expect(() => CustomQuery.fromPagination(params, "Plan")).toThrow(BadRequestException);
    });

    it("should build search filter when searchBy and searchFor are provided", () => {
      const params = new PaginationParams({
        searchBy: "name",
        searchFor: "Basic",
      });

      const query = CustomQuery.fromPagination(params, "Plan");

      expect(query.where).toEqual({ name: { contains: "Basic" } });
    });
  });

  describe("getTotalPage", () => {
    it("should return 0 when offset/limit is 0", () => {
      expect(getTotalPage(100, 0)).toBe(0);
    });

    it("should calculate exact page count", () => {
      expect(getTotalPage(100, 10)).toBe(10);
      expect(getTotalPage(25, 10)).toBe(3);
      expect(getTotalPage(9, 10)).toBe(1);
    });
  });
});
