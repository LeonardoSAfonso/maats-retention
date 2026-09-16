import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { OutcomeType, ReasonCategory, RiskBand } from "@repo/contracts";

export class CreateCancellationDTO {
  @IsString()
  subscriptionId: string;

  @IsString()
  rawReason: string;

  @IsOptional()
  @IsEnum(ReasonCategory)
  reasonCategory?: ReasonCategory;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  risk?: number;

  @IsOptional()
  @IsEnum(RiskBand)
  band?: RiskBand;

  @IsOptional()
  @IsEnum(OutcomeType)
  outcomeType?: OutcomeType;

  @IsOptional()
  @IsString()
  humanReason?: string;
}

export default CreateCancellationDTO;
