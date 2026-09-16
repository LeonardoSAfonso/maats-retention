import { Injectable } from "@nestjs/common";
import { type Prisma, type Subscriber } from "@prisma/client";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreateSubscriberDTO } from "./domain/create.dto.js";
import { UpdateSubscriberDTO } from "./domain/update.dto.js";

@Injectable()
export class SubscriberRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateSubscriberDTO): Promise<Subscriber> {
    return this.prismaService.subscriber.create({
      data,
    });
  }

  public async find(params: PaginationParams<Subscriber>) {
    const query = CustomQuery.fromPagination<
      Subscriber,
      Prisma.SubscriberWhereInput,
      Prisma.SubscriberOrderByWithRelationInput
    >(params, "Subscriber");

    const elements = await this.prismaService.subscriber.count({
      where: query.where,
    });

    const subscribers = await this.prismaService.subscriber.findMany({
      ...query.toPrismaOptions(),
    });

    return { elements, subscribers };
  }

  public async findById(id: string): Promise<Subscriber | null> {
    return this.prismaService.subscriber.findUnique({
      where: { id },
    });
  }

  public async findByEmail(email: string): Promise<Subscriber | null> {
    return this.prismaService.subscriber.findUnique({
      where: { email },
    });
  }

  public async update(id: string, data: UpdateSubscriberDTO): Promise<Subscriber> {
    return this.prismaService.subscriber.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Subscriber> {
    return this.prismaService.subscriber.delete({
      where: { id },
    });
  }

  public async upsert(id: string, data: CreateSubscriberDTO): Promise<Subscriber> {
    return this.prismaService.subscriber.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  public async saveMany(subscribers: Array<{ id: string } & CreateSubscriberDTO>): Promise<void> {
    for (const sub of subscribers) {
      const { id, ...data } = sub;
      await this.upsert(id, data);
    }
  }
}

export default SubscriberRepository;
