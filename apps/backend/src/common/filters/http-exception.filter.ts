import {
  type ArgumentsHost,
  type ExceptionFilter,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { type Response } from "express";
import { getCorrelationId } from "../logger/correlation.context.js";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const correlationId = getCorrelationId();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null;

    let message = "Internal server error";
    let details: unknown = null;

    if (typeof exceptionResponse === "string") {
      message = exceptionResponse;
    } else if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      const respMsg = (exceptionResponse as { message: unknown }).message;
      if (Array.isArray(respMsg)) {
        message = "Validation failed";
        details = respMsg;
      } else {
        message = String(respMsg);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    this.logger.error(
      `[${status}] ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      ...(details ? { details } : {}),
      ...(correlationId ? { correlationId } : {}),
      timestamp: new Date().toISOString(),
    });
  }
}

export default HttpExceptionFilter;
