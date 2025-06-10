/**
 * JSON 验证和解析工具函数
 */

/**
 * 检查字符串是否为有效的 JSON 格式
 *
 * @param str - 要检查的字符串
 * @returns 是否为有效的 JSON 字符串
 *
 * @example
 * ```typescript
 * isValidJsonString('{"name": "John"}'); // true
 * isValidJsonString('"hello world"'); // true
 * isValidJsonString('hello world'); // false
 * isValidJsonString('123'); // true
 * isValidJsonString('true'); // true
 * isValidJsonString('null'); // true
 * isValidJsonString('undefined'); // false
 * ```
 */
export function isValidJsonString(str: string): boolean {
  // 空字符串不是有效的 JSON
  if (typeof str !== "string" || str.trim() === "") {
    return false;
  }

  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * 安全的 JSON 解析，不会抛出错误
 *
 * @param str - 要解析的字符串
 * @param defaultValue - 解析失败时的默认值
 * @returns 解析结果或默认值
 *
 * @example
 * ```typescript
 * safeJsonParse('{"name": "John"}'); // { name: "John" }
 * safeJsonParse('invalid json'); // undefined
 * safeJsonParse('invalid json', {}); // {}
 * safeJsonParse('hello world', 'fallback'); // 'fallback'
 * ```
 */
export function safeJsonParse<T = unknown>(
  str: string,
  defaultValue?: T
): T | undefined {
  if (typeof str !== "string") {
    return defaultValue;
  }

  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的 JSON 解析，返回详细结果
 *
 * @param str - 要解析的字符串
 * @returns 包含成功状态、数据和错误信息的对象
 *
 * @example
 * ```typescript
 * safeJsonParseWithResult('{"name": "John"}');
 * // { success: true, data: { name: "John" }, error: null }
 *
 * safeJsonParseWithResult('invalid json');
 * // { success: false, data: undefined, error: SyntaxError }
 * ```
 */
export function safeJsonParseWithResult<T = unknown>(
  str: string
): {
  success: boolean;
  data: T | undefined;
  error: Error | null;
} {
  if (typeof str !== "string") {
    return {
      success: false,
      data: undefined,
      error: new TypeError("Input must be a string"),
    };
  }

  try {
    const data = JSON.parse(str) as T;
    return {
      success: true,
      data,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      data: undefined,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * 智能内容解析：优先尝试 JSON 解析，失败则返回原字符串
 * 专门用于处理混合数据的场景（有时是 JSON，有时是普通字符串）
 *
 * @param content - 要解析的内容（字符串或已解析的对象）
 * @returns 解析后的数据
 *
 * @example
 * ```typescript
 * // JSON 字符串会被解析
 * parseContentSafely('{"name": "John"}'); // { name: "John" }
 * parseContentSafely('[1, 2, 3]'); // [1, 2, 3]
 * parseContentSafely('"hello"'); // "hello"
 * parseContentSafely('123'); // 123
 * parseContentSafely('true'); // true
 *
 * // 普通字符串返回原值
 * parseContentSafely('hello world'); // "hello world"
 * parseContentSafely('用户输入的文本'); // "用户输入的文本"
 *
 * // 已经是对象的直接返回
 * parseContentSafely({ name: "John" }); // { name: "John" }
 * ```
 */
export function parseContentSafely<T = unknown>(content: unknown): T {
  // 如果不是字符串，直接返回
  if (typeof content !== "string") {
    return content as T;
  }

  // 空字符串直接返回
  if (content.trim() === "") {
    return content as T;
  }

  // 尝试 JSON 解析
  try {
    return JSON.parse(content) as T;
  } catch {
    // 解析失败，返回原字符串
    return content as T;
  }
}

/**
 * 检查值是否需要 JSON 序列化
 *
 * @param value - 要检查的值
 * @returns 是否需要序列化
 *
 * @example
 * ```typescript
 * needsJsonStringify("hello"); // false (已经是字符串)
 * needsJsonStringify(123); // false (数字会被自动转换)
 * needsJsonStringify({ name: "John" }); // true (对象需要序列化)
 * needsJsonStringify([1, 2, 3]); // true (数组需要序列化)
 * needsJsonStringify(true); // false (布尔值会被自动转换)
 * needsJsonStringify(null); // false (null 会被自动转换)
 * ```
 */
export function needsJsonStringify(value: unknown): boolean {
  // 这些类型不需要序列化，可以直接转换为字符串
  if (
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return false;
  }

  // 对象和数组需要序列化
  return typeof value === "object" || Array.isArray(value);
}

/**
 * 安全的 JSON 字符串化，包含错误处理
 *
 * @param value - 要序列化的值
 * @param replacer - JSON.stringify 的 replacer 参数
 * @param space - JSON.stringify 的 space 参数
 * @returns 序列化结果或 null
 *
 * @example
 * ```typescript
 * safeJsonStringify({ name: "John" }); // '{"name":"John"}'
 * safeJsonStringify(circularObj); // null (处理循环引用)
 * ```
 */
export function safeJsonStringify(
  value: unknown,
  replacer?: (this: unknown, key: string, value: unknown) => unknown,
  space?: string | number
): string | null {
  try {
    return JSON.stringify(value, replacer, space);
  } catch (error) {
    console.warn("JSON stringify failed:", error);
    return null;
  }
}

/**
 * ============================================================================
 * 📚 JSON 工具函数使用指南
 * ============================================================================
 *
 * 这些工具函数专门用于处理 JSON 数据的验证、解析和序列化，
 * 特别适用于处理混合数据类型和不确定数据格式的场景。
 *
 * 🎯 **主要解决的问题：**
 * 1. 避免 JSON.parse() 抛出的 SyntaxError
 * 2. 处理混合数据（有时是 JSON 字符串，有时是普通字符串）
 * 3. 安全的数据序列化和反序列化
 * 4. 提供更好的错误处理和调试信息
 *
 * 📖 **推荐使用场景：**
 *
 * 1️⃣ **数据库存储/读取**
 * ```typescript
 * // 存储时
 * const content = needsJsonStringify(data)
 *   ? safeJsonStringify(data) || String(data)
 *   : String(data);
 *
 * // 读取时
 * const parsed = parseContentSafely(storedContent);
 * ```
 *
 * 2️⃣ **API 数据处理**
 * ```typescript
 * // 验证 JSON 格式
 * if (isValidJsonString(apiResponse)) {
 *   const data = safeJsonParse(apiResponse);
 * }
 *
 * // 获取详细错误信息
 * const { success, data, error } = safeJsonParseWithResult(apiResponse);
 * if (!success) {
 *   console.error('解析失败:', error.message);
 * }
 * ```
 *
 * 3️⃣ **用户输入处理**
 * ```typescript
 * // 智能解析用户输入（可能是JSON，也可能是普通文本）
 * const userInput = '{"name": "张三"}';
 * const parsed = parseContentSafely(userInput); // { name: "张三" }
 *
 * const plainText = '你好世界';
 * const parsed2 = parseContentSafely(plainText); // "你好世界"
 * ```
 *
 * 4️⃣ **Redis/缓存系统**
 * ```typescript
 * // 存储到 Redis
 * await redis.set(key, safeJsonStringify(complexObject) || 'fallback');
 *
 * // 从 Redis 读取
 * const stored = await redis.get(key);
 * const data = parseContentSafely(stored);
 * ```
 *
 * 🔧 **函数选择指南：**
 *
 * - `isValidJsonString()` - 快速验证字符串是否为有效 JSON
 * - `safeJsonParse()` - 简单的安全解析，带默认值
 * - `safeJsonParseWithResult()` - 需要详细错误信息时使用
 * - `parseContentSafely()` - 混合数据处理的首选 ⭐
 * - `needsJsonStringify()` - 序列化前的类型检查
 * - `safeJsonStringify()` - 安全的序列化，处理循环引用等问题
 *
 * ⚡ **性能说明：**
 *
 * 这些函数在设计时考虑了性能：
 * - 使用类型检查避免不必要的 JSON 操作
 * - 提前返回，减少计算开销
 * - 缓存友好的设计
 *
 * 🚨 **注意事项：**
 *
 * 1. 这些函数主要处理字符串和对象，不适用于特殊类型（如 Function、Symbol）
 * 2. 循环引用的对象会导致 safeJsonStringify 返回 null
 * 3. 大型对象的序列化可能消耗较多内存和时间
 * 4. parseContentSafely 会优先尝试 JSON 解析，这意味着 "123" 会被解析为数字 123
 *
 * 💡 **最佳实践：**
 *
 * - 在数据库操作中优先使用 parseContentSafely
 * - 对于已知格式的数据，使用更具体的函数（如 safeJsonParse）
 * - 在生产环境中始终处理解析失败的情况
 * - 使用 TypeScript 泛型指定期望的返回类型
 *
 * ============================================================================
 */
