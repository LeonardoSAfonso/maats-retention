import { Module } from "@nestjs/common";
import { OfferRepository } from "./repository.js";

@Module({
  providers: [OfferRepository],
  exports: [OfferRepository],
})
export class OfferModule {}

export default OfferModule;
