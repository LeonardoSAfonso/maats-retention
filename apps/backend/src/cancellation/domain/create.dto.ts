import { IsEnum, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { OutcomeType, ReasonCategory, RiskBand } from "@repo/contracts";

export class CreateCancellationDTO {
  @IsString()
  subscriptionId: string;

  @IsString()
  rawReason: string;

  @IsOptional()
  @IsEnum(ReasonCategory)
  reasonCategory?: ReasonCategory | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  risk?: number | null;

  @IsOptional()
  @IsEnum(RiskBand)
  band?: RiskBand | null;

  @IsOptional()
  @IsEnum(OutcomeType)
  outcomeType?: OutcomeType | null;

  @IsOptional()
  @IsString()
  humanReason?: string | null;
}

export default CreateCancellationDTO;
