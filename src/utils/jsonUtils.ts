// src/utils/jsonUtils.ts - ULTRA SAFE VERSION

export const safeJSONParse = <T = any>(
  jsonString: string | null | undefined,
  fallback: T
): T => {
  // Handle null/undefined
  if (jsonString === null || jsonString === undefined) {
    return fallback;
  }

  // Handle already parsed objects
  if (typeof jsonString === "object") {
    return jsonString as T;
  }

  // Handle non-string types
  if (typeof jsonString !== "string") {
    console.warn("[JSON Parse] Input is not a string:", typeof jsonString);
    return fallback;
  }

  // Handle empty or invalid strings
  if (
    jsonString === "" ||
    jsonString === "null" ||
    jsonString === "undefined"
  ) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);

    // If fallback is an array, ensure result is also an array
    if (Array.isArray(fallback)) {
      return Array.isArray(parsed) ? (parsed as T) : fallback;
    }

    // If fallback is an object, ensure result is also an object
    if (typeof fallback === "object" && fallback !== null && parsed !== null) {
      return typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as T)
        : fallback;
    }

    return parsed as T;
  } catch (error) {
    console.error("[JSON Parse] Failed to parse:", {
      input: jsonString?.substring(0, 100),
      error: error instanceof Error ? error.message : String(error),
    });
    return fallback;
  }
};

export const safeJSONStringify = (
  value: any,
  fallback: string = "[]"
): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return fallback;
  }

  // If already a string, validate it's valid JSON
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value; // Already valid JSON string
    } catch {
      // Not valid JSON, wrap it
      return JSON.stringify(value);
    }
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("[JSON Stringify] Failed to stringify:", error);
    return fallback;
  }
};

/**
 * Extra safe array parser - ALWAYS returns an array
 */
export const safeArrayParse = <T = any>(
  jsonString: string | null | undefined,
  fallback: T[] = []
): T[] => {
  const result = safeJSONParse(jsonString, fallback);
  return Array.isArray(result) ? result : fallback;
};

/**
 * Extra safe object parser - ALWAYS returns an object
 */
export const safeObjectParse = <T = any>(
  jsonString: string | null | undefined,
  fallback: T = {} as T
): T => {
  const result = safeJSONParse(jsonString, fallback);
  return typeof result === "object" && result !== null ? result : fallback;
};
