import { IsDateString, IsEnum, IsString } from "class-validator";
import { EngagementType } from "@repo/contracts";

export class CreateEngagementEventDTO {
  @IsString()
  subscriptionId: string;

  @IsEnum(EngagementType)
  type: EngagementType;

  @IsDateString()
  occurredAt: string;
}

export default CreateEngagementEventDTO;
