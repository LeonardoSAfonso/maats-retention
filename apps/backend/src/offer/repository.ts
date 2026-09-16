import { Injectable } from "@nestjs/common";
import { type Offer, type Prisma } from "@prisma/client";
import { OfferStatus } from "@repo/contracts";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreateOfferDTO } from "./domain/create.dto.js";
import { UpdateOfferDTO } from "./domain/update.dto.js";

@Injectable()
export class OfferRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateOfferDTO): Promise<Offer> {
    return this.prismaService.offer.create({
      data,
    });
  }

  public async find(params: PaginationParams<Offer>) {
    const query = CustomQuery.fromPagination<
      Offer,
      Prisma.OfferWhereInput,
      Prisma.OfferOrderByWithRelationInput
    >(params, "Offer");

    const elements = await this.prismaService.offer.count({
      where: query.where,
    });

    const offers = await this.prismaService.offer.findMany({
      ...query.toPrismaOptions(),
    });

    return { elements, offers };
  }

  public async findById(id: string): Promise<Offer | null> {
    return this.prismaService.offer.findUnique({
      where: { id },
    });
  }

  public async findByCancellationId(cancellationId: string): Promise<Offer | null> {
    return this.prismaService.offer.findFirst({
      where: { cancellationId },
      orderBy: { createdAt: "desc" },
    });
  }

  public async update(id: string, data: UpdateOfferDTO): Promise<Offer> {
    return this.prismaService.offer.update({
      where: { id },
      data,
    });
  }

  public async upsert(id: string, data: CreateOfferDTO): Promise<Offer> {
    return this.prismaService.offer.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  public async updateStatus(id: string, status: OfferStatus): Promise<Offer> {
    return this.prismaService.offer.update({
      where: { id },
      data: { status },
    });
  }

  public async delete(id: string): Promise<Offer> {
    return this.prismaService.offer.delete({
      where: { id },
    });
  }
}

export default OfferRepository;
