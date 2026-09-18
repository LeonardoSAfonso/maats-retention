import { Injectable } from "@nestjs/common";
import { type Prisma, type ReasonCategory, type ReasonKeyword } from "@prisma/client";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreateReasonKeywordDTO } from "./domain/create.dto.js";
import { UpdateReasonKeywordDTO } from "./domain/update.dto.js";

@Injectable()
export class ReasonKeywordRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreateReasonKeywordDTO): Promise<ReasonKeyword> {
    return this.prismaService.reasonKeyword.create({
      data,
    });
  }

  public async find(params: PaginationParams<ReasonKeyword>) {
    const query = CustomQuery.fromPagination<
      ReasonKeyword,
      Prisma.ReasonKeywordWhereInput,
      Prisma.ReasonKeywordOrderByWithRelationInput
    >(params, "ReasonKeyword");

    const elements = await this.prismaService.reasonKeyword.count({
      where: query.where,
    });

    const reasonKeywords = await this.prismaService.reasonKeyword.findMany({
      ...query.toPrismaOptions(),
    });

    return { elements, reasonKeywords };
  }

  public async findById(id: string): Promise<ReasonKeyword | null> {
    return this.prismaService.reasonKeyword.findUnique({
      where: { id },
    });
  }

  public async findByTerm(term: string): Promise<ReasonKeyword | null> {
    return this.prismaService.reasonKeyword.findUnique({
      where: { term },
    });
  }

  public async findByCategory(category: ReasonCategory): Promise<ReasonKeyword[]> {
    return this.prismaService.reasonKeyword.findMany({
      where: { category },
      orderBy: { term: "asc" },
    });
  }

  public async findAll(): Promise<ReasonKeyword[]> {
    return this.prismaService.reasonKeyword.findMany({
      orderBy: { term: "asc" },
    });
  }

  public async update(id: string, data: UpdateReasonKeywordDTO): Promise<ReasonKeyword> {
    return this.prismaService.reasonKeyword.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<ReasonKeyword> {
    return this.prismaService.reasonKeyword.delete({
      where: { id },
    });
  }

  public async upsert(data: CreateReasonKeywordDTO): Promise<ReasonKeyword> {
    return this.prismaService.reasonKeyword.upsert({
      where: { term: data.term },
      create: data,
      update: { category: data.category },
    });
  }

  public async saveMany(keywords: CreateReasonKeywordDTO[]): Promise<void> {
    for (const item of keywords) {
      await this.upsert(item);
    }
  }
}

export default ReasonKeywordRepository;
