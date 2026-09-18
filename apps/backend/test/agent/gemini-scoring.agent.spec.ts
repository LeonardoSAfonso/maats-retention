import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scenarios, type ScoringInput } from "@repo/contracts";
import { DeterministicScoringAgent } from "../../src/agent/scoring/deterministic-scoring.agent.js";
import { GeminiScoringAgent } from "../../src/agent/scoring/gemini-scoring.agent.js";

describe("GeminiScoringAgent (Unit Tests)", () => {
  const originalEnv = process.env;
  let mockFallback: DeterministicScoringAgent;
  const sampleScenario = scenarios[0]!;
  const sampleInput: ScoringInput = {
    subscriber: sampleScenario.subscriber,
    subscription: sampleScenario.subscription,
    plan: sampleScenario.plan,
    engagementEvents: sampleScenario.engagementEvents,
    paymentEvents: sampleScenario.paymentEvents,
    rawReason: sampleScenario.rawReason,
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    mockFallback = new DeterministicScoringAgent(0);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("delegates to fallback agent when GEMINI_API_KEY is not set", async () => {
    delete process.env["GEMINI_API_KEY"];
    delete process.env["GOOGLE_API_KEY"];

    const fallbackSpy = vi.spyOn(mockFallback, "score");
    const agent = new GeminiScoringAgent(mockFallback);

    const result = await agent.score(sampleInput);

    expect(fallbackSpy).toHaveBeenCalledWith(sampleInput);
    expect(result.risk).toBe(sampleScenario.expectedRisk);
  });

  it("calls Gemini API and parses structured output when API key is set", async () => {
    process.env["GEMINI_API_KEY"] = "test-gemini-key";

    const fakeGeminiResponse = {
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  risk: 0.18,
                  rationale: "Assinante antigo com uso constante e baixo risco de churn.",
                }),
              },
            ],
          },
        },
      ],
    };

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fakeGeminiResponse,
    });
    vi.stubGlobal("fetch", fetchSpy);

    const agent = new GeminiScoringAgent(mockFallback);
    const result = await agent.score(sampleInput);

    expect(fetchSpy).toHaveBeenCalled();
    expect(result.risk).toBe(0.18);
    expect(result.rationale).toBe("Assinante antigo com uso constante e baixo risco de churn.");
    expect(result.timedOut).toBe(false);
  });

  it("falls back to deterministic scoring when Gemini returns HTTP error", async () => {
    process.env["GEMINI_API_KEY"] = "test-gemini-key";

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      text: async () => "Quota exceeded",
    });
    vi.stubGlobal("fetch", fetchSpy);

    const fallbackSpy = vi.spyOn(mockFallback, "score");
    const agent = new GeminiScoringAgent(mockFallback);
    const result = await agent.score(sampleInput);

    expect(fetchSpy).toHaveBeenCalled();
    expect(fallbackSpy).toHaveBeenCalledWith(sampleInput);
    expect(result.risk).toBe(sampleScenario.expectedRisk);
  });

  it("falls back to deterministic scoring when Gemini response is malformed JSON", async () => {
    process.env["GEMINI_API_KEY"] = "test-gemini-key";

    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [{ content: { parts: [{ text: "not-a-json" }] } }],
      }),
    });
    vi.stubGlobal("fetch", fetchSpy);

    const fallbackSpy = vi.spyOn(mockFallback, "score");
    const agent = new GeminiScoringAgent(mockFallback);
    const result = await agent.score(sampleInput);

    expect(fallbackSpy).toHaveBeenCalledWith(sampleInput);
    expect(result.risk).toBe(sampleScenario.expectedRisk);
  });
});
