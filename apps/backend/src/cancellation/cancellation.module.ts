import { Module } from "@nestjs/common";
import { AgentModule } from "../agent/agent.module.js";
import { EventModule } from "../event/event.module.js";
import { OfferModule } from "../offer/offer.module.js";
import { PlanModule } from "../plan/plan.module.js";
import { SubscriptionModule } from "../subscription/subscription.module.js";
import { CancellationController } from "./cancellation.controller.js";
import { CancellationService } from "./cancellation.service.js";
import { CancellationRepository } from "./repository.js";

@Module({
  imports: [AgentModule, SubscriptionModule, PlanModule, OfferModule, EventModule],
  controllers: [CancellationController],
  providers: [CancellationRepository, CancellationService],
  exports: [CancellationRepository, CancellationService],
})
export class CancellationModule {}

export default CancellationModule;
