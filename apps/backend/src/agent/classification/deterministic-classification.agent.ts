import { Injectable, Optional } from "@nestjs/common";
import {
  ReasonCategory,
  type ClassificationAgent,
  type ClassificationInput,
  type ClassificationResult,
} from "@repo/contracts";
import { ReasonKeywordRepository } from "../../reason-keyword/repository.js";

const CATEGORY_PRIORITY: Record<string, number> = {
  [ReasonCategory.PRICE]: 1,
  [ReasonCategory.LACK_OF_USE]: 2,
  [ReasonCategory.TECHNICAL_ISSUE]: 3,
  [ReasonCategory.COMPETITION]: 4,
  [ReasonCategory.OTHER]: 5,
};

const CATEGORY_CONFIDENCE: Record<string, number> = {
  [ReasonCategory.PRICE]: 0.95,
  [ReasonCategory.LACK_OF_USE]: 0.9,
  [ReasonCategory.TECHNICAL_ISSUE]: 0.9,
  [ReasonCategory.COMPETITION]: 0.85,
  [ReasonCategory.OTHER]: 0.7,
};

const FALLBACK_KEYWORDS: Array<{ term: string; category: ReasonCategory }> = [
  // PRICE
  { term: "expensive", category: ReasonCategory.PRICE },
  { term: "preço", category: ReasonCategory.PRICE },
  { term: "preco", category: ReasonCategory.PRICE },
  { term: "caro", category: ReasonCategory.PRICE },
  { term: "custo", category: ReasonCategory.PRICE },
  { term: "worth the price", category: ReasonCategory.PRICE },
  { term: "worth continuing", category: ReasonCategory.PRICE },
  { term: "premium features", category: ReasonCategory.PRICE },
  { term: "valor", category: ReasonCategory.PRICE },
  { term: "mensalidade", category: ReasonCategory.PRICE },

  // LACK_OF_USE
  { term: "few months", category: ReasonCategory.LACK_OF_USE },
  { term: "traveling", category: ReasonCategory.LACK_OF_USE },
  { term: "viagem", category: ReasonCategory.LACK_OF_USE },
  { term: "tempo", category: ReasonCategory.LACK_OF_USE },
  { term: "pouco uso", category: ReasonCategory.LACK_OF_USE },
  { term: "não uso", category: ReasonCategory.LACK_OF_USE },
  { term: "nao uso", category: ReasonCategory.LACK_OF_USE },
  { term: "no longer using", category: ReasonCategory.LACK_OF_USE },
  { term: "sem tempo", category: ReasonCategory.LACK_OF_USE },

  // TECHNICAL_ISSUE
  { term: "bug", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "erro", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "técnico", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "tecnico", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "travando", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "lento", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "falha", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "technical", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "app", category: ReasonCategory.TECHNICAL_ISSUE },
  { term: "aplicativo", category: ReasonCategory.TECHNICAL_ISSUE },

  // COMPETITION
  { term: "concorrente", category: ReasonCategory.COMPETITION },
  { term: "concorrência", category: ReasonCategory.COMPETITION },
  { term: "concorrencia", category: ReasonCategory.COMPETITION },
  { term: "netflix", category: ReasonCategory.COMPETITION },
  { term: "prime", category: ReasonCategory.COMPETITION },
  { term: "disney", category: ReasonCategory.COMPETITION },
  { term: "outro", category: ReasonCategory.COMPETITION },
  { term: "outra", category: ReasonCategory.COMPETITION },
];

@Injectable()
export class DeterministicClassificationAgent implements ClassificationAgent {
  constructor(
    @Optional()
    private readonly keywordRepo?: ReasonKeywordRepository,
  ) {}

  public async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const raw = (input.rawReason ?? "").toLowerCase();

    let keywords: Array<{ term: string; category: string }> = FALLBACK_KEYWORDS;

    if (this.keywordRepo) {
      try {
        const dbKeywords = await this.keywordRepo.findAll();
        if (dbKeywords.length > 0) {
          keywords = dbKeywords;
        }
      } catch {
        keywords = FALLBACK_KEYWORDS;
      }
    }

    const sortedKeywords = [...keywords].sort(
      (a, b) => (CATEGORY_PRIORITY[a.category] ?? 99) - (CATEGORY_PRIORITY[b.category] ?? 99),
    );

    for (const item of sortedKeywords) {
      if (raw.includes(item.term.toLowerCase())) {
        const category = item.category as ReasonCategory;
        return {
          category,
          confidence: CATEGORY_CONFIDENCE[category] ?? 0.85,
          latencyMs: 50,
        };
      }
    }

    return {
      category: ReasonCategory.OTHER,
      confidence: 0.7,
      latencyMs: 50,
    };
  }
}

export default DeterministicClassificationAgent;
