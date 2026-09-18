import { Injectable, type LoggerService } from "@nestjs/common";
import { pino, type Logger as PinoInstance } from "pino";
import { getCorrelationId } from "./correlation.context.js";

@Injectable()
export class StructuredLoggerService implements LoggerService {
  private readonly pinoLogger: PinoInstance;

  constructor() {
    this.pinoLogger = pino({
      level: process.env["LOG_LEVEL"] || "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label }),
      },
    });
  }

  private extractAttributes(
    message: unknown,
    optionalParams: unknown[],
  ): { attributes: Record<string, unknown>; msg: string } {
    let context: string | undefined;
    let meta: unknown = undefined;

    if (optionalParams.length > 0) {
      const lastParam = optionalParams[optionalParams.length - 1];
      if (typeof lastParam === "string") {
        context = lastParam;
        if (optionalParams.length > 1) {
          meta = optionalParams.length === 2 ? optionalParams[0] : optionalParams.slice(0, -1);
        }
      } else {
        meta = optionalParams.length === 1 ? optionalParams[0] : optionalParams;
      }
    }

    const correlationId = getCorrelationId();
    const attributes: Record<string, unknown> = {};

    if (context) attributes["context"] = context;
    if (correlationId) attributes["correlationId"] = correlationId;
    if (meta !== undefined) attributes["meta"] = meta;

    const msg = typeof message === "string" ? message : JSON.stringify(message);

    return { attributes, msg };
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    const { attributes, msg } = this.extractAttributes(message, optionalParams);
    this.pinoLogger.info(attributes, msg);
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    let stack: string | undefined;
    let context: string | undefined;

    if (optionalParams.length === 1) {
      if (typeof optionalParams[0] === "string") {
        if (optionalParams[0].includes("\n") || optionalParams[0].startsWith("Error:")) {
          stack = optionalParams[0];
        } else {
          context = optionalParams[0];
        }
      }
    } else if (optionalParams.length >= 2) {
      stack = typeof optionalParams[0] === "string" ? optionalParams[0] : undefined;
      context = typeof optionalParams[1] === "string" ? optionalParams[1] : undefined;
    }

    const correlationId = getCorrelationId();
    const attributes: Record<string, unknown> = {};

    if (context) attributes["context"] = context;
    if (correlationId) attributes["correlationId"] = correlationId;
    if (stack) attributes["stack"] = stack;

    const msg = typeof message === "string" ? message : JSON.stringify(message);
    this.pinoLogger.error(attributes, msg);
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    const { attributes, msg } = this.extractAttributes(message, optionalParams);
    this.pinoLogger.warn(attributes, msg);
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    const { attributes, msg } = this.extractAttributes(message, optionalParams);
    this.pinoLogger.debug(attributes, msg);
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    const { attributes, msg } = this.extractAttributes(message, optionalParams);
    this.pinoLogger.trace(attributes, msg);
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    const { attributes, msg } = this.extractAttributes(message, optionalParams);
    this.pinoLogger.fatal(attributes, msg);
  }
}

export default StructuredLoggerService;
