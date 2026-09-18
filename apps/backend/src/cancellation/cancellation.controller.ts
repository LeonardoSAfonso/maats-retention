import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  type CancellationDetailResponse,
  type CreateCancellationResponse,
  type OfferActionResponse,
} from "@repo/contracts";
import { CancellationService } from "./cancellation.service.js";
import { CreateCancellationRequestDTO } from "./domain/create-cancellation.dto.js";

@ApiTags("Cancelamentos")
@Controller("cancellations")
export class CancellationController {
  constructor(private readonly cancellationService: CancellationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Criar solicitação de cancelamento e processar com camada de IA",
    description:
      "Submete o motivo livre do assinante, executa o agente de scoring e de classificação em paralelo, avalia as regras de risco e alto valor, e persiste o desfecho (CANCELLED, HUMAN_RETENTION ou AUTOMATIC_OFFER).",
  })
  @ApiResponse({
    status: 201,
    description: "Cancelamento processado e resultado gerado com sucesso.",
  })
  @ApiResponse({
    status: 400,
    description: "Payload inválido ou campos obrigatórios ausentes.",
  })
  @ApiResponse({
    status: 404,
    description: "Assinatura informada não foi encontrada.",
  })
  public async create(
    @Body() dto: CreateCancellationRequestDTO,
  ): Promise<CreateCancellationResponse> {
    return this.cancellationService.processCancellation(dto);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Consultar detalhes do cancelamento por protocolo",
    description:
      "Recupera o registro de cancelamento com faixa de risco, desfecho, oferta associada (quando houver) e dados cadastrais.",
  })
  @ApiParam({
    name: "id",
    description: "ID do cancelamento UUIDv7",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @ApiResponse({
    status: 200,
    description: "Detalhes do cancelamento encontrados.",
  })
  @ApiResponse({
    status: 404,
    description: "Protocolo de cancelamento não localizado.",
  })
  public async findById(@Param("id") id: string): Promise<CancellationDetailResponse> {
    return this.cancellationService.findById(id);
  }

  @Post(":id/accept")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Aceitar oferta de retenção automática",
    description:
      "Atualiza o status da oferta de retenção para ACCEPTED, mantendo a assinatura ativa com desconto e registrando o sucesso da retenção.",
  })
  @ApiParam({
    name: "id",
    description: "ID do cancelamento associado à oferta",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @ApiResponse({
    status: 200,
    description: "Oferta aceita com sucesso.",
  })
  @ApiResponse({
    status: 404,
    description: "Cancelamento ou oferta associada não encontrada.",
  })
  public async acceptOffer(@Param("id") id: string): Promise<OfferActionResponse> {
    return this.cancellationService.acceptOffer(id);
  }

  @Post(":id/decline")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Recusar oferta de retenção automática e prosseguir com o cancelamento",
    description:
      "Atualiza o status da oferta de retenção para DECLINED e formaliza o cancelamento definitivo do plano.",
  })
  @ApiParam({
    name: "id",
    description: "ID do cancelamento associado à oferta",
    example: "0191ebc5-4e4a-7239-b353-a18517d74e04",
  })
  @ApiResponse({
    status: 200,
    description: "Oferta recusada e cancelamento concluído.",
  })
  @ApiResponse({
    status: 404,
    description: "Cancelamento ou oferta associada não encontrada.",
  })
  public async declineOffer(@Param("id") id: string): Promise<OfferActionResponse> {
    return this.cancellationService.declineOffer(id);
  }
}

export default CancellationController;
