export function safeJsonParse(str: string, defaultValue?: unknown): unknown {
  if (typeof str !== "string") {
    return defaultValue;
  }

  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
}
