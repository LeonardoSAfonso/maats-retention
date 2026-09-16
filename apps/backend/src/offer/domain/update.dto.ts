import { PartialType } from "@nestjs/mapped-types";
import { CreateOfferDTO } from "./create.dto.js";

export class UpdateOfferDTO extends PartialType(CreateOfferDTO) {}

export default UpdateOfferDTO;
