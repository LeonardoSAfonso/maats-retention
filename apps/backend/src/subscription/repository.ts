import { Injectable } from "@nestjs/common";
import { type Prisma, type Subscription } from "@prisma/client";
import { type SubscriptionStatus } from "@repo/contracts";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreateSubscriptionDTO } from "./domain/create.dto.js";
import { UpdateSubscriptionDTO } from "./domain/update.dto.js";

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateSubscriptionDTO): Promise<Subscription> {
    return this.prismaService.subscription.create({
      data,
      include: {
        subscriber: true,
        plan: true,
      },
    });
  }

  public async find(params: PaginationParams<Subscription>) {
    const query = CustomQuery.fromPagination<
      Subscription,
      Prisma.SubscriptionWhereInput,
      Prisma.SubscriptionOrderByWithRelationInput
    >(params, "Subscription");

    const elements = await this.prismaService.subscription.count({
      where: query.where,
    });

    const subscriptions = await this.prismaService.subscription.findMany({
      ...query.toPrismaOptions(),
      include: {
        subscriber: true,
        plan: true,
      },
    });

    return { elements, subscriptions };
  }

  public async findById(id: string): Promise<Subscription | null> {
    return this.prismaService.subscription.findUnique({
      where: { id },
      include: {
        subscriber: true,
        plan: true,
      },
    });
  }

  public async findDetailById(id: string) {
    return this.prismaService.subscription.findUnique({
      where: { id },
      include: {
        subscriber: true,
        plan: true,
      },
    });
  }

  public async findBySubscriberId(subscriberId: string): Promise<Subscription[]> {
    return this.prismaService.subscription.findMany({
      where: { subscriberId },
      include: {
        subscriber: true,
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async findAllWithDetails() {
    return this.prismaService.subscription.findMany({
      include: {
        subscriber: true,
        plan: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  public async update(id: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    return this.prismaService.subscription.update({
      where: { id },
      data,
      include: {
        subscriber: true,
        plan: true,
      },
    });
  }

  public async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    return this.prismaService.subscription.update({
      where: { id },
      data: { status },
      include: {
        subscriber: true,
        plan: true,
      },
    });
  }

  public async delete(id: string): Promise<Subscription> {
    return this.prismaService.subscription.delete({
      where: { id },
    });
  }

  public async upsert(id: string, data: CreateSubscriptionDTO): Promise<Subscription> {
    return this.prismaService.subscription.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
      include: {
        subscriber: true,
        plan: true,
      },
    });
  }

  public async saveMany(
    subscriptions: Array<{ id: string } & CreateSubscriptionDTO>,
  ): Promise<void> {
    for (const sub of subscriptions) {
      const { id, ...data } = sub;
      await this.upsert(id, data);
    }
  }
}

export default SubscriptionRepository;
