import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationParams } from "./pagination.type.js";

function buildNestedObject(path: string[], value: unknown): Record<string, unknown> {
  return path.reduceRight<Record<string, unknown>>(
    (acc, key) => ({ [key]: acc }),
    value as Record<string, unknown>,
  );
}

export function validateQueryFields(modelName: string, fieldsString: string): boolean {
  const fields = fieldsString.split(",");

  for (const fieldExpr of fields) {
    const cleanFieldExpr = fieldExpr.trim();
    if (!cleanFieldExpr) {
      continue;
    }

    const path = cleanFieldExpr.split(".");
    let currentModelName = modelName;

    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const model = Prisma.dmmf.datamodel.models.find(
        (m) => m.name.toLowerCase() === currentModelName.toLowerCase(),
      );
      if (!model) {
        return false;
      }

      const field = model.fields.find((f) => f.name === segment);
      if (!field) {
        return false;
      }

      if (field.kind === "object") {
        if (i === path.length - 1) {
          return false;
        }
        currentModelName = field.type;
      } else if (i !== path.length - 1) {
        return false;
      }
    }
  }

  return true;
}

export class CustomQuery<Where = Record<string, unknown>, OrderBy = Record<string, unknown>> {
  take?: number | undefined;
  skip?: number | undefined;
  where: Where = {} as Where;
  orderBy?: OrderBy | OrderBy[] | undefined;

  static fromPagination<T, Where = Record<string, unknown>, OrderBy = Record<string, unknown>>(
    params: PaginationParams<T>,
    modelName: string,
  ): CustomQuery<Where, OrderBy> {
    const query = new CustomQuery<Where, OrderBy>();

    if (params.limit !== undefined) {
      query.limit(params.limit);
    }
    if (params.offset !== undefined) {
      query.offset(params.offset);
    }

    if (params.orderBy) {
      if (!validateQueryFields(modelName, params.orderBy)) {
        throw new BadRequestException(
          `Ordenação inválida: o campo '${params.orderBy}' não existe na entidade '${modelName}' ou suas relações.`,
        );
      }

      const orderValue = params.order || "asc";
      const fields = params.orderBy.split(",");

      if (fields.length > 1) {
        const orderConditions = fields.map((field) => {
          const cleanField = field.trim();
          if (cleanField.includes(".")) {
            const path = cleanField.split(".");
            return buildNestedObject(path, orderValue);
          }
          return { [cleanField]: orderValue };
        });
        query.order(orderConditions as unknown as OrderBy[]);
      } else {
        const field = (fields[0] ?? "").trim();
        if (field.includes(".")) {
          const path = field.split(".");
          query.order(buildNestedObject(path, orderValue) as unknown as OrderBy);
        } else {
          query.order({ [field]: orderValue } as unknown as OrderBy);
        }
      }
    }

    if (params.searchBy && params.searchFor) {
      if (!validateQueryFields(modelName, params.searchBy)) {
        throw new BadRequestException(
          `Busca inválida: o campo '${params.searchBy}' não existe na entidade '${modelName}' ou suas relações.`,
        );
      }

      const filterValue = { contains: params.searchFor };
      const fields = params.searchBy.split(",");

      if (fields.length > 1) {
        const orConditions = fields.map((field) => {
          const cleanField = field.trim();
          if (cleanField.includes(".")) {
            const path = cleanField.split(".");
            return buildNestedObject(path, filterValue);
          }
          return { [cleanField]: filterValue };
        });
        query.filter({ OR: orConditions } as unknown as Record<string, unknown>);
      } else {
        const field = (fields[0] ?? "").trim();
        if (field.includes(".")) {
          const path = field.split(".");
          query.filter(buildNestedObject(path, filterValue));
        } else {
          query.filter({ [field]: filterValue });
        }
      }
    }

    return query;
  }

  offset(skip?: number): this {
    this.skip = skip;
    return this;
  }

  limit(take?: number): this {
    this.take = take;
    return this;
  }

  filter(conditions: Record<string, unknown>): this {
    this.where = { ...this.where, ...conditions };
    return this;
  }

  withCondition(condition: Record<string, unknown>): this {
    if (Object.keys(this.where as Record<string, unknown>).length === 0) {
      this.where = condition as unknown as Where;
    } else {
      this.where = {
        AND: [this.where, condition],
      } as unknown as Where;
    }
    return this;
  }

  order(orderBy: OrderBy | OrderBy[]): this {
    this.orderBy = orderBy;
    return this;
  }

  toPrismaOptions(): {
    where: Where;
    take?: number;
    skip?: number;
    orderBy?: OrderBy | OrderBy[];
  } {
    return {
      where: this.where,
      ...(this.take !== undefined ? { take: this.take } : {}),
      ...(this.skip !== undefined ? { skip: this.skip } : {}),
      ...(this.orderBy !== undefined ? { orderBy: this.orderBy } : {}),
    };
  }
}

export default CustomQuery;
