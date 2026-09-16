import { IsDateString, IsEnum, IsString } from "class-validator";
import { SubscriptionStatus } from "@repo/contracts";

export class CreateSubscriptionDTO {
  @IsString()
  subscriberId: string;

  @IsString()
  planId: string;

  @IsDateString()
  startedAt: string;

  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}

export default CreateSubscriptionDTO;
