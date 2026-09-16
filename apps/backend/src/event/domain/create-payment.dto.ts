import { IsDateString, IsEnum, IsInt, IsString, Min } from "class-validator";
import { PaymentStatus } from "@repo/contracts";

export class CreatePaymentEventDTO {
  @IsString()
  subscriptionId: string;

  @IsInt()
  @Min(0)
  amountCents: number;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsDateString()
  date: string;
}

export default CreatePaymentEventDTO;
