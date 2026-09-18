import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type CancellationDetailResponse,
  type CreateCancellationResponse,
  type OfferActionResponse,
  OfferStatus,
  OfferType,
  OutcomeType,
  RiskBand,
  type UUID,
} from "@repo/contracts";
import { CancellationController } from "../../src/cancellation/cancellation.controller.js";
import { type CancellationService } from "../../src/cancellation/cancellation.service.js";

describe("CancellationController (Unit Tests)", () => {
  let controller: CancellationController;
  let mockService: Partial<CancellationService>;

  beforeEach(() => {
    mockService = {
      processCancellation: vi.fn(),
      findById: vi.fn(),
      acceptOffer: vi.fn(),
      declineOffer: vi.fn(),
    };
    controller = new CancellationController(mockService as CancellationService);
  });

  it("POST /cancellations calls processCancellation", async () => {
    const mockResponse: CreateCancellationResponse = {
      cancellation: {
        id: "canc-1" as UUID,
        subscriptionId: "sub-1" as UUID,
        rawReason: "Preço",
        risk: 0.15,
        band: RiskBand.LOW,
        outcome: { type: OutcomeType.CANCELLED },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    vi.mocked(mockService.processCancellation!).mockResolvedValue(mockResponse);

    const result = await controller.create({
      subscriptionId: "sub-1" as UUID,
      rawReason: "Preço",
    });

    expect(mockService.processCancellation).toHaveBeenCalledWith({
      subscriptionId: "sub-1",
      rawReason: "Preço",
    });
    expect(result).toEqual(mockResponse);
  });

  it("GET /cancellations/:id calls findById", async () => {
    const mockDetail: CancellationDetailResponse = {
      cancellation: {
        id: "canc-1" as UUID,
        subscriptionId: "sub-1" as UUID,
        rawReason: "Preço",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      subscription: {} as never,
      subscriber: {} as never,
      plan: {} as never,
    };
    vi.mocked(mockService.findById!).mockResolvedValue(mockDetail);

    const result = await controller.findById("canc-1");
    expect(mockService.findById).toHaveBeenCalledWith("canc-1");
    expect(result).toEqual(mockDetail);
  });

  it("POST /cancellations/:id/accept calls acceptOffer", async () => {
    const mockResponse: OfferActionResponse = {
      offer: {
        id: "off-1" as UUID,
        cancellationId: "canc-1" as UUID,
        type: OfferType.DISCOUNT,
        status: OfferStatus.ACCEPTED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      cancellation: {} as never,
    };
    vi.mocked(mockService.acceptOffer!).mockResolvedValue(mockResponse);

    const result = await controller.acceptOffer("canc-1");
    expect(mockService.acceptOffer).toHaveBeenCalledWith("canc-1");
    expect(result).toEqual(mockResponse);
  });

  it("POST /cancellations/:id/decline calls declineOffer", async () => {
    const mockResponse: OfferActionResponse = {
      offer: {
        id: "off-1" as UUID,
        cancellationId: "canc-1" as UUID,
        type: OfferType.DISCOUNT,
        status: OfferStatus.DECLINED,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      cancellation: {} as never,
    };
    vi.mocked(mockService.declineOffer!).mockResolvedValue(mockResponse);

    const result = await controller.declineOffer("canc-1");
    expect(mockService.declineOffer).toHaveBeenCalledWith("canc-1");
    expect(result).toEqual(mockResponse);
  });
});
