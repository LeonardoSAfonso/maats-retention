import { Module } from "@nestjs/common";
import { DeterministicClassificationAgent } from "./classification/deterministic-classification.agent.js";
import { GeminiClassificationAgent } from "./classification/gemini-classification.agent.js";
import { DeterministicScoringAgent } from "./scoring/deterministic-scoring.agent.js";
import { GeminiScoringAgent } from "./scoring/gemini-scoring.agent.js";
import { CLASSIFICATION_AGENT, SCORING_AGENT } from "./tokens.js";
import { ReasonKeywordModule } from "../reason-keyword/reason-keyword.module.js";

@Module({
  imports: [ReasonKeywordModule],
  providers: [
    DeterministicScoringAgent,
    GeminiScoringAgent,
    DeterministicClassificationAgent,
    GeminiClassificationAgent,
    {
      provide: SCORING_AGENT,
      useFactory: (geminiAgent: GeminiScoringAgent, mockAgent: DeterministicScoringAgent) => {
        const agentType = process.env["SCORING_AGENT_TYPE"]?.toLowerCase();
        if (agentType === "gemini" || agentType === "llm") {
          return geminiAgent;
        }
        return mockAgent;
      },
      inject: [GeminiScoringAgent, DeterministicScoringAgent],
    },
    {
      provide: CLASSIFICATION_AGENT,
      useFactory: (
        geminiAgent: GeminiClassificationAgent,
        mockAgent: DeterministicClassificationAgent,
      ) => {
        const agentType = process.env["CLASSIFICATION_AGENT_TYPE"]?.toLowerCase();
        if (agentType === "gemini" || agentType === "llm") {
          return geminiAgent;
        }
        return mockAgent;
      },
      inject: [GeminiClassificationAgent, DeterministicClassificationAgent],
    },
  ],
  exports: [
    SCORING_AGENT,
    CLASSIFICATION_AGENT,
    DeterministicScoringAgent,
    GeminiScoringAgent,
    DeterministicClassificationAgent,
    GeminiClassificationAgent,
  ],
})
export class AgentModule {}

export default AgentModule;
