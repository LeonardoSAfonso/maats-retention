import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { OfferStatus, OfferType } from "@repo/contracts";

export class CreateOfferDTO {
  @IsString()
  cancellationId: string;

  @IsEnum(OfferType)
  type: OfferType;

  @IsOptional()
  @IsInt()
  @Min(0)
  amountCents?: number;

  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}

export default CreateOfferDTO;
