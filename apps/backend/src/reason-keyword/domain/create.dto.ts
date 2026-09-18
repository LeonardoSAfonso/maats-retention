import { IsEnum, IsString, MinLength } from "class-validator";
import { ReasonCategory } from "@repo/contracts";

export class CreateReasonKeywordDTO {
  @IsString()
  @MinLength(1)
  term: string;

  @IsEnum(ReasonCategory)
  category: ReasonCategory;
}

export default CreateReasonKeywordDTO;
