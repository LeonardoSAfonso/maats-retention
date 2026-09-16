import { Module } from "@nestjs/common";
import { SubscriberRepository } from "./repository.js";

@Module({
  providers: [SubscriberRepository],
  exports: [SubscriberRepository],
})
export class SubscriberModule {}

export default SubscriberModule;
