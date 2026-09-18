import { Module } from "@nestjs/common";
import { SubscriptionRepository } from "./repository.js";
import { SubscriptionController } from "./subscription.controller.js";
import { SubscriptionService } from "./subscription.service.js";

@Module({
  controllers: [SubscriptionController],
  providers: [SubscriptionRepository, SubscriptionService],
  exports: [SubscriptionRepository, SubscriptionService],
})
export class SubscriptionModule {}

export default SubscriptionModule;
