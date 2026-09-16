import { Injectable } from "@nestjs/common";
import { type EngagementEvent, type PaymentEvent, type Prisma } from "@prisma/client";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreateEngagementEventDTO } from "./domain/create-engagement.dto.js";
import { CreatePaymentEventDTO } from "./domain/create-payment.dto.js";

@Injectable()
export class EventRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async createEngagement(data: CreateEngagementEventDTO): Promise<EngagementEvent> {
    return this.prismaService.engagementEvent.create({
      data,
    });
  }

  public async createPayment(data: CreatePaymentEventDTO): Promise<PaymentEvent> {
    return this.prismaService.paymentEvent.create({
      data,
    });
  }

  public async findEngagement(params: PaginationParams<EngagementEvent>) {
    const query = CustomQuery.fromPagination<
      EngagementEvent,
      Prisma.EngagementEventWhereInput,
      Prisma.EngagementEventOrderByWithRelationInput
    >(params, "EngagementEvent");

    const elements = await this.prismaService.engagementEvent.count({
      where: query.where,
    });

    const events = await this.prismaService.engagementEvent.findMany({
      ...query.toPrismaOptions(),
    });

    return { elements, events };
  }

  public async findPayments(params: PaginationParams<PaymentEvent>) {
    const query = CustomQuery.fromPagination<
      PaymentEvent,
      Prisma.PaymentEventWhereInput,
      Prisma.PaymentEventOrderByWithRelationInput
    >(params, "PaymentEvent");

    const elements = await this.prismaService.paymentEvent.count({
      where: query.where,
    });

    const events = await this.prismaService.paymentEvent.findMany({
      ...query.toPrismaOptions(),
    });

    return { elements, events };
  }

  public async findEngagementBySubscriptionId(subscriptionId: string): Promise<EngagementEvent[]> {
    return this.prismaService.engagementEvent.findMany({
      where: { subscriptionId },
      orderBy: { occurredAt: "asc" },
    });
  }

  public async findPaymentsBySubscriptionId(subscriptionId: string): Promise<PaymentEvent[]> {
    return this.prismaService.paymentEvent.findMany({
      where: { subscriptionId },
      orderBy: { date: "asc" },
    });
  }

  public async upsertEngagement(
    id: string,
    data: CreateEngagementEventDTO,
  ): Promise<EngagementEvent> {
    return this.prismaService.engagementEvent.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  public async upsertPayment(id: string, data: CreatePaymentEventDTO): Promise<PaymentEvent> {
    return this.prismaService.paymentEvent.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  public async saveEngagementEvents(
    events: Array<{ id: string } & CreateEngagementEventDTO>,
  ): Promise<void> {
    for (const event of events) {
      const { id, ...data } = event;
      await this.upsertEngagement(id, data);
    }
  }

  public async savePaymentEvents(
    events: Array<{ id: string } & CreatePaymentEventDTO>,
  ): Promise<void> {
    for (const event of events) {
      const { id, ...data } = event;
      await this.upsertPayment(id, data);
    }
  }
}

export default EventRepository;
