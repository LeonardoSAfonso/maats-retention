import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { type SubscriptionListResponse } from "@repo/contracts";
import { SubscriptionService } from "./subscription.service.js";

@ApiTags("Assinaturas")
@Controller("subscriptions")
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({
    summary: "Listar todas as assinaturas ativas com planos e assinantes",
    description:
      "Retorna a relação de assinaturas elegíveis para cancelamento, populadas com seus respectivos titulares e planos.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de assinaturas ativas recuperada com sucesso.",
  })
  public async findAll(): Promise<SubscriptionListResponse> {
    return this.subscriptionService.findAll();
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obter detalhes de uma assinatura específica por ID",
    description:
      "Recupera o registro da assinatura informada, acompanhado dos dados completos do titular e benefícios do plano.",
  })
  @ApiParam({
    name: "id",
    description: "ID da assinatura UUIDv7",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @ApiResponse({
    status: 200,
    description: "Detalhes da assinatura, assinante e plano encontrados.",
  })
  @ApiResponse({
    status: 404,
    description: "Assinatura não localizada.",
  })
  public async findById(@Param("id") id: string) {
    return this.subscriptionService.findById(id);
  }
}

export default SubscriptionController;
