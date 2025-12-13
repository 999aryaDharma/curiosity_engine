// src/utils/errorTracker.ts

class ErrorTracker {
  private static logs: string[] = [];

  static track(location: string, data?: any) {
    // FIX: Handle undefined data safely
    const dataStr = data !== undefined ? JSON.stringify(data) : "N/A";

    // Gunakan '|| ""' sebagai pengaman tambahan jika stringify gagal/null
    const safeDataStr = (dataStr || "").substring(0, 100);

    const log = `[TRACK] ${location}: ${safeDataStr}`;
    console.log(log);
    this.logs.push(log);
  }

  static error(location: string, error: any, data?: any) {
    // FIX: Handle undefined data safely here too
    const dataStr = data !== undefined ? JSON.stringify(data) : "N/A";
    const safeDataStr = (dataStr || "").substring(0, 200);

    // FIX: Ensure stack is a string safely
    const stackStr = error?.stack ? String(error.stack) : "";

    const errorLog = `
========================================
[ERROR LOCATION] ${location}
[ERROR] ${error?.message || String(error)}
[DATA] ${safeDataStr}
[STACK] ${stackStr.substring(0, 500)}
========================================
`;
    console.error(errorLog);
    this.logs.push(errorLog);
  }

  static getLogs() {
    return this.logs.join("\n");
  }

  static clear() {
    this.logs = [];
  }
}

export default ErrorTracker;

// Global error handler
if (typeof ErrorUtils !== "undefined") {
  const originalHandler = ErrorUtils.getGlobalHandler();

  ErrorUtils.setGlobalHandler((error, isFatal) => {
    ErrorTracker.error("GLOBAL_ERROR", error, { isFatal });

    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  });
}
