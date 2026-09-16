import { type MiddlewareConsumer, type NestModule, Module } from "@nestjs/common";

import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { AppLoggerMiddleware } from "./common/middlewares/app-logger.middleware.js";
import { DbModule } from "./db/db.module.js";

@Module({
  imports: [DbModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("{*splat}");
  }
}
