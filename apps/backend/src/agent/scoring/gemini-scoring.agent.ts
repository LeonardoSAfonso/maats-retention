import { Injectable, Logger } from "@nestjs/common";
import { type ScoringAgent, type ScoringInput, type ScoringResult } from "@repo/contracts";
import { DeterministicScoringAgent } from "./deterministic-scoring.agent.js";

@Injectable()
export class GeminiScoringAgent implements ScoringAgent {
  private readonly logger = new Logger(GeminiScoringAgent.name);
  private readonly apiKey: string | undefined;
  private readonly modelName: string;

  constructor(private readonly deterministicFallback: DeterministicScoringAgent) {
    this.apiKey = process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"];
    this.modelName = process.env["GEMINI_MODEL"] ?? "gemini-2.5-flash";
  }

  public async score(input: ScoringInput): Promise<ScoringResult> {
    if (!this.apiKey) {
      this.logger.debug(
        "GEMINI_API_KEY not configured. Falling back to deterministic scoring agent.",
      );
      return this.deterministicFallback.score(input);
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(input);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text:
                  "Você é um agente especialista em retenção de assinaturas e predição de risco de churn. " +
                  "Analise os dados cadastrais do assinante, histórico de tempo de contrato, engajamento recente, pontualidade de pagamentos e a justificativa de cancelamento informada. " +
                  "Atribua um score numérico de risco de churn entre 0.00 e 1.00 (onde < 0.30 é baixo risco, 0.30 a 0.70 é zona cinzenta/moderado, e > 0.70 é alto risco) " +
                  "e forneça uma justificativa concisa em português brasileiro.",
              },
            ],
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                risk: {
                  type: "NUMBER",
                  description: "Risco estimado de churn entre 0.00 e 1.00",
                },
                rationale: {
                  type: "STRING",
                  description: "Justificativa da pontuação atribuída em português brasileiro",
                },
              },
              required: ["risk", "rationale"],
            },
          },
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.warn(
          `Gemini API error (HTTP ${response.status}): ${errorText}. Falling back to deterministic scoring.`,
        );
        return this.deterministicFallback.score(input);
      }

      const data = (await response.json()) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
        }>;
      };

      const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        this.logger.warn("Empty response received from Gemini API. Falling back.");
        return this.deterministicFallback.score(input);
      }

      const parsed = JSON.parse(candidateText) as { risk?: number; rationale?: string };
      if (typeof parsed.risk !== "number" || Number.isNaN(parsed.risk)) {
        this.logger.warn(`Invalid risk format in Gemini response: ${candidateText}. Falling back.`);
        return this.deterministicFallback.score(input);
      }

      const clampedRisk = Math.max(0, Math.min(1, Math.round(parsed.risk * 100) / 100));

      return {
        risk: clampedRisk,
        rationale: parsed.rationale ?? "Análise de risco gerada pelo Google Gemini",
        latencyMs,
        timedOut: false,
      };
    } catch (error) {
      this.logger.error(
        `Exception occurred during Gemini scoring: ${error instanceof Error ? error.message : String(error)}. Falling back.`,
      );
      return this.deterministicFallback.score(input);
    }
  }

  private buildPrompt(input: ScoringInput): string {
    const paymentStatuses = (input.paymentEvents ?? []).map((p) => p.status);
    const onTimeCount = paymentStatuses.filter((s) => s === "ON_TIME").length;
    const lateCount = paymentStatuses.filter((s) => s === "LATE").length;
    const failedCount = paymentStatuses.filter((s) => s === "FAILED").length;

    const engagementTypes = (input.engagementEvents ?? []).map((e) => e.type);

    return JSON.stringify(
      {
        subscriber: {
          name: input.subscriber.name,
          email: input.subscriber.email,
        },
        subscription: {
          planName: input.plan.name,
          planPriceCents: input.plan.priceCents,
          billingCycle: input.plan.cycle,
          startedAt: input.subscription.startedAt,
        },
        engagementHistory: {
          totalEvents: engagementTypes.length,
          events: engagementTypes,
        },
        paymentHistory: {
          totalPayments: paymentStatuses.length,
          onTime: onTimeCount,
          late: lateCount,
          failed: failedCount,
        },
        statedCancellationReason: input.rawReason,
      },
      null,
      2,
    );
  }
}

export default GeminiScoringAgent;
