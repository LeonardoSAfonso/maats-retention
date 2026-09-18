import { describe, expect, it, vi } from "vitest";
import { ReasonCategory, type Subscription } from "@repo/contracts";
import { DeterministicClassificationAgent } from "../../src/agent/classification/deterministic-classification.agent.js";
import type { ReasonKeywordRepository } from "../../src/reason-keyword/repository.js";

describe("DeterministicClassificationAgent (Unit Tests)", () => {
  const mockSubscription = {} as Subscription;

  describe("Fallback mode (without database repository)", () => {
    const agent = new DeterministicClassificationAgent();

    it("classifies price concerns as PRICE", async () => {
      const result = await agent.classify({
        rawReason: "Too expensive for what it offers, I will cancel.",
        subscription: mockSubscription,
      });
      expect(result.category).toBe(ReasonCategory.PRICE);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("classifies lack of use and travel as LACK_OF_USE", async () => {
      const result = await agent.classify({
        rawReason: "Will be traveling for a few months without access.",
        subscription: mockSubscription,
      });
      expect(result.category).toBe(ReasonCategory.LACK_OF_USE);
    });

    it("classifies bugs and performance issues as TECHNICAL_ISSUE", async () => {
      const result = await agent.classify({
        rawReason: "O aplicativo está travando com erro técnico constante.",
        subscription: mockSubscription,
      });
      expect(result.category).toBe(ReasonCategory.TECHNICAL_ISSUE);
    });

    it("classifies mentions of competitor streaming services as COMPETITION", async () => {
      const result = await agent.classify({
        rawReason: "Decidi assinar a netflix que tem mais conteúdo.",
        subscription: mockSubscription,
      });
      expect(result.category).toBe(ReasonCategory.COMPETITION);
    });

    it("defaults unclassified reasons to OTHER", async () => {
      const result = await agent.classify({
        rawReason: "I want to cancel now.",
        subscription: mockSubscription,
      });
      expect(result.category).toBe(ReasonCategory.OTHER);
    });
  });

  describe("Dynamic mode (with ReasonKeywordRepository)", () => {
    it("dynamically classifies newly added terms from database", async () => {
      const mockRepo = {
        findAll: vi.fn().mockResolvedValue([
          { id: "1", term: "grana curta", category: ReasonCategory.PRICE },
          { id: "2", term: "hbo max", category: ReasonCategory.COMPETITION },
        ]),
      } as unknown as ReasonKeywordRepository;

      const dynamicAgent = new DeterministicClassificationAgent(mockRepo);

      const result1 = await dynamicAgent.classify({
        rawReason: "Estou com a grana curta este mês.",
        subscription: mockSubscription,
      });
      expect(result1.category).toBe(ReasonCategory.PRICE);
      expect(mockRepo.findAll).toHaveBeenCalled();

      const result2 = await dynamicAgent.classify({
        rawReason: "Migrei para a hbo max.",
        subscription: mockSubscription,
      });
      expect(result2.category).toBe(ReasonCategory.COMPETITION);
    });

    it("falls back to default keywords if repository query fails", async () => {
      const mockRepo = {
        findAll: vi.fn().mockRejectedValue(new Error("DB connection error")),
      } as unknown as ReasonKeywordRepository;

      const dynamicAgent = new DeterministicClassificationAgent(mockRepo);

      const result = await dynamicAgent.classify({
        rawReason: "Too expensive for what it offers.",
        subscription: mockSubscription,
      });
      expect(result.category).toBe(ReasonCategory.PRICE);
    });
  });
});
