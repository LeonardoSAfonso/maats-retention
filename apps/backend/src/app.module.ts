import { type MiddlewareConsumer, type NestModule, Module } from "@nestjs/common";

import { AppController } from "@/app.controller";
import { AppService } from "@/app.service";
import { AppLoggerMiddleware } from "@/common/middlewares/app-logger.middleware";
import { DbModule } from "@/db/db.module";

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
