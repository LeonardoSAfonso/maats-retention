import { Controller, Get, Param } from "@nestjs/common";
import { type SubscriptionListResponse } from "@repo/contracts";
import { SubscriptionService } from "./subscription.service.js";

@Controller("subscriptions")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  public async findAll(): Promise<SubscriptionListResponse> {
    return this.subscriptionService.findAll();
  }

  @Get(":id")
  public async findById(@Param("id") id: string) {
    return this.subscriptionService.findById(id);
  }
}

export default SubscriptionController;
