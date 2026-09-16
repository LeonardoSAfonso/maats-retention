import { Module } from "@nestjs/common";
import { EventRepository } from "./repository.js";

@Module({
  providers: [EventRepository],
  exports: [EventRepository],
})
export class EventModule {}

export default EventModule;
