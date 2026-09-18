import "dotenv/config";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module.js";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter.js";
import { StructuredLoggerService } from "./common/logger/structured-logger.service.js";

async function bootstrap() {
  const logger = new StructuredLoggerService();
  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.enableCors();
  app.enableShutdownHooks();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuração OpenAPI / Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Minha Claro - API de Retenção Inteligente")
    .setDescription(
      "Documentação OpenAPI / Swagger dos endpoints da PoC de autoatendimento e inteligência de churn.",
    )
    .setVersion("1.0.0")
    .addTag("Assinaturas", "Endpoints de consulta de assinaturas ativas, planos e assinantes")
    .addTag("Cancelamentos", "Fluxo de cancelamento, orquestração de IA e decisões de retenção")
    .addTag("Métricas", "Indicadores consolidados da PoC de retenção")
    .addTag("Saúde", "Healthcheck da API e pool do banco de dados")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document, {
    customSiteTitle: "Minha Claro | Swagger API Docs",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  const port = Number(process.env["PORT"] ?? 3000);
  await app.listen(port);
  logger.log(
    `Application is running on: http://localhost:${port} (Swagger: http://localhost:${port}/docs)`,
    "Bootstrap",
  );
}

await bootstrap();
