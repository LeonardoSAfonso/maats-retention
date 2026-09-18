import { type OutcomeType, type RiskBand } from "@repo/contracts";

export interface EvaluateDecisionInput {
  risk?: number | undefined | null;
  isHighValuePlan: boolean;
  timedOut?: boolean | undefined;
}

export interface RetentionDecision {
  band: RiskBand;
  outcomeType: OutcomeType;
  humanReason?: string | undefined;
}
