import { PartialType } from "@nestjs/mapped-types";
import { CreateSubscriberDTO } from "./create.dto.js";

export class UpdateSubscriberDTO extends PartialType(CreateSubscriberDTO) {}

export default UpdateSubscriberDTO;
