import { Injectable } from "@nestjs/common";
import { type Cancellation, type Prisma } from "@prisma/client";
import {
  HUMAN_RETENTION_COST_CENTS,
  type MetricsResponse,
  OfferStatus,
  OutcomeType,
  RiskBand,
} from "@repo/contracts";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreateCancellationDTO } from "./domain/create.dto.js";
import { UpdateCancellationDTO } from "./domain/update.dto.js";

export type CancellationWithOffers = Prisma.CancellationGetPayload<{
  include: { offers: true };
}>;

@Injectable()
export class CancellationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateCancellationDTO): Promise<CancellationWithOffers> {
    return this.prismaService.cancellation.create({
      data,
      include: { offers: true },
    });
  }

  public async find(params: PaginationParams<Cancellation>) {
    const query = CustomQuery.fromPagination<
      Cancellation,
      Prisma.CancellationWhereInput,
      Prisma.CancellationOrderByWithRelationInput
    >(params, "Cancellation");

    const elements = await this.prismaService.cancellation.count({
      where: query.where,
    });

    const cancellations = await this.prismaService.cancellation.findMany({
      ...query.toPrismaOptions(),
      include: { offers: true },
    });

    return { elements, cancellations };
  }

  public async findById(id: string): Promise<CancellationWithOffers | null> {
    return this.prismaService.cancellation.findUnique({
      where: { id },
      include: { offers: true },
    });
  }

  public async findBySubscriptionId(
    subscriptionId: string,
  ): Promise<CancellationWithOffers | null> {
    return this.prismaService.cancellation.findFirst({
      where: { subscriptionId },
      include: { offers: true },
      orderBy: { createdAt: "desc" },
    });
  }

  public async update(id: string, data: UpdateCancellationDTO): Promise<CancellationWithOffers> {
    return this.prismaService.cancellation.update({
      where: { id },
      data,
      include: { offers: true },
    });
  }

  public async upsert(id: string, data: CreateCancellationDTO): Promise<CancellationWithOffers> {
    return this.prismaService.cancellation.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
      include: { offers: true },
    });
  }

  public async delete(id: string): Promise<Cancellation> {
    return this.prismaService.cancellation.delete({
      where: { id },
    });
  }

  public async getMetrics(): Promise<MetricsResponse> {
    const records = await this.prismaService.cancellation.findMany({
      where: { outcomeType: { not: null } },
      include: { offers: true },
    });

    const totalCancellations = records.length;
    let humanRetentions = 0;
    let automaticCancellations = 0;
    const riskDistribution: Record<RiskBand, number> = {
      [RiskBand.LOW]: 0,
      [RiskBand.GREY]: 0,
      [RiskBand.HIGH]: 0,
    };

    for (const record of records) {
      if (record.band && record.band in riskDistribution) {
        riskDistribution[record.band as RiskBand]++;
      }
      if (record.outcomeType === OutcomeType.HUMAN_RETENTION) {
        humanRetentions++;
      } else if (record.outcomeType === OutcomeType.CANCELLED) {
        automaticCancellations++;
      } else if (record.outcomeType === OutcomeType.AUTOMATIC_OFFER) {
        const hasAcceptedOffer = record.offers?.some((o) => o.status === OfferStatus.ACCEPTED);
        if (hasAcceptedOffer) {
          automaticCancellations++;
        }
      }
    }

    const avoidedCostCents = (totalCancellations - humanRetentions) * HUMAN_RETENTION_COST_CENTS;
    const retentionRate = totalCancellations > 0 ? automaticCancellations / totalCancellations : 0;

    return {
      totalCancellations,
      automaticCancellations,
      humanRetentions,
      avoidedCostCents,
      retentionRate,
      riskDistribution,
    };
  }
}

export default CancellationRepository;
