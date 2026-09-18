import { Injectable, Logger, Optional } from "@nestjs/common";
import {
  PaymentStatus,
  SCORING_TIMEOUT_MS,
  scenarios,
  type ScoringAgent,
  type ScoringInput,
  type ScoringResult,
} from "@repo/contracts";

@Injectable()
export class DeterministicScoringAgent implements ScoringAgent {
  private readonly logger = new Logger(DeterministicScoringAgent.name);

  constructor(@Optional() private readonly simulatedLatencyMs: number = 250) {}

  public async score(input: ScoringInput): Promise<ScoringResult> {
    const scenario = scenarios.find((s) => s.subscription.id === input.subscription.id);

    if (scenario?.simulateTimeout) {
      this.logger.debug(
        `Simulating timeout for subscription ${input.subscription.id} (${scenario.id})`,
      );
      const delayMs = SCORING_TIMEOUT_MS + 500;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return {
        risk: undefined as unknown as number,
        rationale: "Simulation exceeded timeout threshold",
        latencyMs: delayMs,
        timedOut: true,
      };
    }

    if (scenario && scenario.expectedRisk !== undefined) {
      if (this.simulatedLatencyMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
      }
      return {
        risk: scenario.expectedRisk,
        rationale: scenario.description,
        latencyMs: this.simulatedLatencyMs,
        timedOut: false,
      };
    }

    // Dynamic heuristic evaluation for subscriptions not present in the seed scenarios
    const heuristicRisk = this.calculateHeuristicRisk(input);
    if (this.simulatedLatencyMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.simulatedLatencyMs));
    }

    return {
      risk: heuristicRisk,
      rationale: "Deterministic heuristic evaluation based on payment and engagement history",
      latencyMs: this.simulatedLatencyMs,
      timedOut: false,
    };
  }

  private calculateHeuristicRisk(input: ScoringInput): number {
    let score = 0.3; // base risk

    const payments = input.paymentEvents ?? [];
    for (const payment of payments) {
      if (payment.status === PaymentStatus.FAILED) {
        score += 0.35;
      } else if (payment.status === PaymentStatus.LATE) {
        score += 0.2;
      }
    }

    const engagements = input.engagementEvents ?? [];
    if (engagements.length === 0) {
      score += 0.25;
    } else if (engagements.length >= 3) {
      score -= 0.2;
    }

    // Clamp between 0.05 and 0.95, rounded to 2 decimal places
    const clamped = Math.max(0.05, Math.min(0.95, score));
    return Math.round(clamped * 100) / 100;
  }
}

export default DeterministicScoringAgent;
