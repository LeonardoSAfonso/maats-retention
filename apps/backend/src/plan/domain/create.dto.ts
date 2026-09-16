import { IsArray, IsEnum, IsInt, IsString, Min } from "class-validator";
import { BillingCycle } from "@repo/contracts";

export class CreatePlanDTO {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  priceCents: number;

  @IsEnum(BillingCycle)
  cycle: BillingCycle;

  @IsArray()
  @IsString({ each: true })
  benefits: string[];
}

export default CreatePlanDTO;
