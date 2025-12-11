export const safeJSONParse = <T = any>(
  jsonString: string | null | undefined,
  fallback: T
): T => {
  if (!jsonString) {
    return fallback;
  }

  try {
    // Check if it's already an object
    if (typeof jsonString === "object") {
      return jsonString as T;
    }

    // Try to parse
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("[JSON Parse] Failed to parse:", error);
    console.error("[JSON Parse] Input was:", jsonString);
    return fallback;
  }
};

export const safeJSONStringify = (
  value: any,
  fallback: string = "[]"
): string => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error("[JSON Stringify] Failed to stringify:", error);
    return fallback;
  }
};
