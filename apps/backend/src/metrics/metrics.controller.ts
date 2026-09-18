import { Controller, Get } from "@nestjs/common";
import { type MetricsResponse } from "@repo/contracts";
import { CancellationService } from "../cancellation/cancellation.service.js";

@Controller("metrics")
export class MetricsController {
  constructor(private readonly cancellationService: CancellationService) {}

  @Get()
  public async getMetrics(): Promise<MetricsResponse> {
    return this.cancellationService.getMetrics();
  }
}

export default MetricsController;
