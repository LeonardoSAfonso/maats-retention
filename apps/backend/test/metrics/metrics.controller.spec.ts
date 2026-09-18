import { beforeEach, describe, expect, it, vi } from "vitest";
import { type MetricsResponse, RiskBand } from "@repo/contracts";
import { type CancellationService } from "../../src/cancellation/cancellation.service.js";
import { MetricsController } from "../../src/metrics/metrics.controller.js";

describe("MetricsController (Unit Tests)", () => {
  let controller: MetricsController;
  let mockService: Partial<CancellationService>;

  beforeEach(() => {
    mockService = {
      getMetrics: vi.fn(),
    };
    controller = new MetricsController(mockService as CancellationService);
  });

  it("GET /metrics returns metrics response", async () => {
    const mockMetrics: MetricsResponse = {
      totalCancellations: 10,
      automaticCancellations: 4,
      humanRetentions: 6,
      avoidedCostCents: 6000,
      retentionRate: 0.4,
      riskDistribution: {
        [RiskBand.LOW]: 2,
        [RiskBand.GREY]: 4,
        [RiskBand.HIGH]: 4,
      },
    };
    vi.mocked(mockService.getMetrics!).mockResolvedValue(mockMetrics);

    const result = await controller.getMetrics();

    expect(mockService.getMetrics).toHaveBeenCalled();
    expect(result).toEqual(mockMetrics);
  });
});
