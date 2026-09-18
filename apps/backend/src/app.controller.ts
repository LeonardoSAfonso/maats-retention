import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service.js";

@ApiTags("Saúde")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @ApiOperation({
    summary: "Healthcheck da API e do banco de dados",
    description: "Verifica se a API está online e se o pool de conexões do PostgreSQL está ativo.",
  })
  @ApiResponse({
    status: 200,
    description: "Serviço ativo e banco conectado.",
    schema: {
      example: { status: "ok", db: "up" },
    },
  })
  health() {
    return this.appService.health();
  }
}
