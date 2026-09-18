import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import {
  type CancellationDetailResponse,
  type CreateCancellationResponse,
  type OfferActionResponse,
} from "@repo/contracts";
import { CancellationService } from "./cancellation.service.js";
import { CreateCancellationRequestDTO } from "./domain/create-cancellation.dto.js";

@Controller("cancellations")
export class CancellationController {
  constructor(private readonly cancellationService: CancellationService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @Body() dto: CreateCancellationRequestDTO,
  ): Promise<CreateCancellationResponse> {
    return this.cancellationService.processCancellation(dto);
  }

  @Get(":id")
  public async findById(@Param("id") id: string): Promise<CancellationDetailResponse> {
    return this.cancellationService.findById(id);
  }

  @Post(":id/accept")
  @HttpCode(HttpStatus.OK)
  public async acceptOffer(@Param("id") id: string): Promise<OfferActionResponse> {
    return this.cancellationService.acceptOffer(id);
  }

  @Post(":id/decline")
  @HttpCode(HttpStatus.OK)
  public async declineOffer(@Param("id") id: string): Promise<OfferActionResponse> {
    return this.cancellationService.declineOffer(id);
  }
}

export default CancellationController;
