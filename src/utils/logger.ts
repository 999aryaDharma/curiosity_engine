// src/utils/logger.ts

import { LogLevel } from "@type/common.types";
import { APP_CONFIG } from "@constants/config";

class Logger {
  private level: LogLevel = APP_CONFIG.DEBUG_MODE ? "debug" : "info";
  private enabled: boolean = APP_CONFIG.DEBUG_MODE;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  debug(message: string, ...args: any[]): void {
    if (!this.enabled || !this.shouldLog("debug")) return;
    console.log(`[DEBUG] ${this.formatMessage(message)}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!this.enabled || !this.shouldLog("info")) return;
    console.info(`[INFO] ${this.formatMessage(message)}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (!this.enabled || !this.shouldLog("warn")) return;
    console.warn(`[WARN] ${this.formatMessage(message)}`, ...args);
  }

  error(message: string, error?: Error | any, ...args: any[]): void {
    if (!this.enabled || !this.shouldLog("error")) return;
    console.error(`[ERROR] ${this.formatMessage(message)}`, error, ...args);
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }

  private formatMessage(message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${message}`;
  }

  group(label: string): void {
    if (!this.enabled) return;
    console.group(label);
  }

  groupEnd(): void {
    if (!this.enabled) return;
    console.groupEnd();
  }

  time(label: string): void {
    if (!this.enabled) return;
    console.time(label);
  }

  timeEnd(label: string): void {
    if (!this.enabled) return;
    console.timeEnd(label);
  }
}

export default new Logger();
