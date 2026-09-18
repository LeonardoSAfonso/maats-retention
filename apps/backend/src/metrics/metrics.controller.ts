import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { type MetricsResponse } from "@repo/contracts";
import { CancellationService } from "../cancellation/cancellation.service.js";

@ApiTags("Métricas")
@Controller("metrics")
export class MetricsController {
  constructor(private readonly cancellationService: CancellationService) {}

  @Get()
  @ApiOperation({
    summary: "Obter indicadores consolidados da PoC de Retenção Inteligente",
    description:
      "Retorna o volume total de cancelamentos, casos de resolução automatizada, encaminhamentos humanos, custos operacionais evitados e a distribuição das faixas de risco (LOW, GREY, HIGH).",
  })
  @ApiResponse({
    status: 200,
    description: "Métricas consolidadas recuperadas com sucesso.",
  })
  public async getMetrics(): Promise<MetricsResponse> {
    return this.cancellationService.getMetrics();
  }
}

export default MetricsController;
