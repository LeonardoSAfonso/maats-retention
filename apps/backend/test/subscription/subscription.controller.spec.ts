import { beforeEach, describe, expect, it, vi } from "vitest";
import { type SubscriptionListResponse } from "@repo/contracts";
import { SubscriptionController } from "../../src/subscription/subscription.controller.js";
import { type SubscriptionService } from "../../src/subscription/subscription.service.js";

describe("SubscriptionController (Unit Tests)", () => {
  let controller: SubscriptionController;
  let mockService: Partial<SubscriptionService>;

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
    };
    controller = new SubscriptionController(mockService as SubscriptionService);
  });

  it("GET /subscriptions returns list of subscriptions with subscriber and plan", async () => {
    const mockList: SubscriptionListResponse = {
      subscriptions: [
        {
          subscription: {} as never,
          subscriber: {} as never,
          plan: {} as never,
        },
      ],
    };
    vi.mocked(mockService.findAll!).mockResolvedValue(mockList);

    const result = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockList);
  });

  it("GET /subscriptions/:id returns subscription detail", async () => {
    const mockSub = {
      subscription: {} as never,
      subscriber: {} as never,
      plan: {} as never,
    };
    vi.mocked(mockService.findById!).mockResolvedValue(mockSub);

    const result = await controller.findById("sub-1");

    expect(mockService.findById).toHaveBeenCalledWith("sub-1");
    expect(result).toEqual(mockSub);
  });
});
