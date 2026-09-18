import { PartialType } from "@nestjs/mapped-types";
import { CreateReasonKeywordDTO } from "./create.dto.js";

export class UpdateReasonKeywordDTO extends PartialType(CreateReasonKeywordDTO) {}

export default UpdateReasonKeywordDTO;
