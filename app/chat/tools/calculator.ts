import { tool } from "ai";
import { z } from "zod";

// 定义计算器工具的参数模式
export const calculatorToolSchema = z.object({
  expression: z.string().describe("要计算的数学表达式，例如：2 + 3 * 4"),
});

/**
 * 简单的数学表达式计算器
 */
export const calculateExpression = (expression: string): number => {
  // 简单的安全计算实现（实际项目中建议使用更安全的数学库）
  try {
    // 移除所有非数字、运算符、括号和空格的字符
    const cleanExpression = expression.replace(/[^0-9+\-*/().\s]/g, "");

    // 使用 Function 构造器安全计算表达式
    const result = Function(`"use strict"; return (${cleanExpression})`)();

    if (typeof result !== "number" || !isFinite(result)) {
      throw new Error("计算结果无效");
    }

    return result;
  } catch (error) {
    throw new Error(
      `计算表达式时出错: ${error instanceof Error ? error.message : "未知错误"}`
    );
  }
};

/**
 * AI 工具配置 - 计算器
 */
export const calculatorAITool = tool({
  description: "计算数学表达式，支持基本的四则运算和括号",
  parameters: calculatorToolSchema,
  execute: async ({ expression }) => {
    console.log("🧮 AI调用计算器工具:", { expression });

    try {
      const result = calculateExpression(expression);
      console.log("✅ 计算器工具执行成功:", { expression, result });

      return {
        success: true,
        expression,
        result,
        formatted: `${expression} = ${result}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ 计算器工具执行失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "计算失败",
        expression,
      };
    }
  },
});

/**
 * 格式化计算结果为 Markdown
 */
export const formatCalculationResultToMarkdown = (calculationResult: {
  success: boolean;
  expression: string;
  result?: number;
  formatted?: string;
  error?: string;
}): string => {
  if (!calculationResult.success || calculationResult.error) {
    return `## ❌ 计算失败\n\n${calculationResult.error || "未知错误"}`;
  }

  return `## 🧮 计算结果\n\n\`\`\`\n${calculationResult.formatted}\n\`\`\`\n\n`;
};
