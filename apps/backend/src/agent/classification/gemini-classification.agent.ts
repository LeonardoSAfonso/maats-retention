import { Injectable, Logger } from "@nestjs/common";
import {
  ReasonCategory,
  type ClassificationAgent,
  type ClassificationInput,
  type ClassificationResult,
} from "@repo/contracts";
import { DeterministicClassificationAgent } from "./deterministic-classification.agent.js";

@Injectable()
export class GeminiClassificationAgent implements ClassificationAgent {
  private readonly logger = new Logger(GeminiClassificationAgent.name);
  private readonly apiKey: string | undefined;
  private readonly modelName: string;

  constructor(private readonly deterministicFallback: DeterministicClassificationAgent) {
    this.apiKey = process.env["GEMINI_API_KEY"] ?? process.env["GOOGLE_API_KEY"];
    this.modelName = process.env["GEMINI_MODEL"] ?? "gemini-2.5-flash";
  }

  public async classify(input: ClassificationInput): Promise<ClassificationResult> {
    if (!this.apiKey) {
      return this.deterministicFallback.classify(input);
    }

    const startTime = Date.now();

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `Motivo informado pelo assinante: "${input.rawReason}"` }],
            },
          ],
          systemInstruction: {
            parts: [
              {
                text:
                  "Você é um classificador de motivos de cancelamento de assinaturas. " +
                  "Classifique o motivo informado em uma das seguintes categorias canônicas: " +
                  "PRICE (preço, caro, custo, benefício), LACK_OF_USE (falta de uso, viagem, sem tempo), " +
                  "TECHNICAL_ISSUE (problemas técnicos, bugs, travamento, suporte), " +
                  "COMPETITION (migração para outro serviço/concorrente), ou OTHER (outros motivos gerais). " +
                  "Retorne também uma confiança estimada entre 0.00 e 1.00.",
              },
            ],
          },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                category: {
                  type: "STRING",
                  enum: [
                    ReasonCategory.PRICE,
                    ReasonCategory.LACK_OF_USE,
                    ReasonCategory.TECHNICAL_ISSUE,
                    ReasonCategory.COMPETITION,
                    ReasonCategory.OTHER,
                  ],
                },
                confidence: {
                  type: "NUMBER",
                  description: "Confiança na classificação de 0.00 a 1.00",
                },
              },
              required: ["category", "confidence"],
            },
          },
        }),
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        return this.deterministicFallback.classify(input);
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
        return this.deterministicFallback.classify(input);
      }

      const parsed = JSON.parse(candidateText) as {
        category?: ReasonCategory;
        confidence?: number;
      };

      if (!parsed.category || !Object.values(ReasonCategory).includes(parsed.category)) {
        return this.deterministicFallback.classify(input);
      }

      return {
        category: parsed.category,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.9,
        latencyMs,
      };
    } catch (error) {
      this.logger.warn(
        `Gemini classification error: ${error instanceof Error ? error.message : String(error)}. Using fallback.`,
      );
      return this.deterministicFallback.classify(input);
    }
  }
}

export default GeminiClassificationAgent;
