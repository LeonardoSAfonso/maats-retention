import { Module } from "@nestjs/common";
import { SubscriptionRepository } from "./repository.js";

@Module({
  providers: [SubscriptionRepository],
  exports: [SubscriptionRepository],
})
export class SubscriptionModule {}

export default SubscriptionModule;
