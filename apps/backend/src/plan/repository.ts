import { Injectable } from "@nestjs/common";
import { type Plan, type Prisma } from "@prisma/client";
import { PrismaService } from "../orm/prisma.service.js";
import { CustomQuery } from "../shared/types/customQuery.type.js";
import { PaginationParams } from "../shared/types/pagination.type.js";
import { CreatePlanDTO } from "./domain/create.dto.js";
import { UpdatePlanDTO } from "./domain/update.dto.js";

@Injectable()
export class PlanRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public async create(data: CreatePlanDTO): Promise<Plan> {
    return this.prismaService.plan.create({
      data,
    });
  }

  public async find(params: PaginationParams<Plan>) {
    const query = CustomQuery.fromPagination<
      Plan,
      Prisma.PlanWhereInput,
      Prisma.PlanOrderByWithRelationInput
    >(params, "Plan");

    const elements = await this.prismaService.plan.count({
      where: query.where,
    });

    const plans = await this.prismaService.plan.findMany({
      ...query.toPrismaOptions(),
    });

    return { elements, plans };
  }

  public async findById(id: string): Promise<Plan | null> {
    return this.prismaService.plan.findUnique({
      where: { id },
    });
  }

  public async findAll(): Promise<Plan[]> {
    return this.prismaService.plan.findMany({
      orderBy: { priceCents: "asc" },
    });
  }

  public async findDistinctPriceCents(): Promise<number[]> {
    const plans = await this.prismaService.plan.findMany({
      select: { priceCents: true },
      distinct: ["priceCents"],
      orderBy: { priceCents: "asc" },
    });
    return plans.map((p) => p.priceCents);
  }

  public async update(id: string, data: UpdatePlanDTO): Promise<Plan> {
    return this.prismaService.plan.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string): Promise<Plan> {
    return this.prismaService.plan.delete({
      where: { id },
    });
  }

  public async upsert(id: string, data: CreatePlanDTO): Promise<Plan> {
    return this.prismaService.plan.upsert({
      where: { id },
      create: { id, ...data },
      update: data,
    });
  }

  public async saveMany(plans: Array<{ id: string } & CreatePlanDTO>): Promise<void> {
    for (const plan of plans) {
      const { id, ...data } = plan;
      await this.upsert(id, data);
    }
  }
}

export default PlanRepository;
