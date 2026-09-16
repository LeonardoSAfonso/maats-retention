import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class PaginationParams<T = unknown> {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "asc";

  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsString()
  searchBy?: string;

  @IsOptional()
  @IsString()
  searchFor?: string;

  constructor(params?: Partial<PaginationParams<T>>) {
    if (params) {
      Object.assign(this, { order: "asc", ...params });
    }
  }
}

export default PaginationParams;
