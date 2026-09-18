import { Injectable, NotFoundException } from "@nestjs/common";
import { type SubscriptionListResponse } from "@repo/contracts";
import {
  mapPlanToContract,
  mapSubscriberToContract,
  mapSubscriptionToContract,
} from "../shared/mappers.js";
import { SubscriptionRepository } from "./repository.js";

@Injectable()
export class SubscriptionService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  public async findAll(): Promise<SubscriptionListResponse> {
    const records = await this.subscriptionRepository.findAllWithDetails();

    return {
      subscriptions: records.map((record) => ({
        subscription: mapSubscriptionToContract(record),
        subscriber: mapSubscriberToContract(record.subscriber),
        plan: mapPlanToContract(record.plan),
      })),
    };
  }

  public async findById(id: string) {
    const record = await this.subscriptionRepository.findById(id);
    if (!record || !record.subscriber || !record.plan) {
      throw new NotFoundException(`Subscription not found with ID ${id}`);
    }

    return {
      subscription: mapSubscriptionToContract(record),
      subscriber: mapSubscriberToContract(record.subscriber),
      plan: mapPlanToContract(record.plan),
    };
  }
}

export default SubscriptionService;
