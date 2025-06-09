/**
 * 预处理LaTeX内容，将各种格式的数学公式转换为remark-math支持的美元符号格式
 */
function preprocessLaTeX(content) {
  // 步骤1: 保护代码块
  const codeBlocks = [];
  let processedContent = content.replace(
    /(`{3,}[\s\S]*?`{3,}|`[^`\n]+`)/g,
    (match, code) => {
      codeBlocks.push(code);
      return `<<CODE_BLOCK_${codeBlocks.length - 1}>>`;
    }
  );

  // 步骤2: 保护现有的LaTeX表达式
  const latexExpressions = [];
  processedContent = processedContent.replace(
    /(\$\$[\s\S]*?\$\$|\$[^$\n]+\$)/g,
    (match) => {
      latexExpressions.push(match);
      return `<<LATEX_${latexExpressions.length - 1}>>`;
    }
  );

  // 步骤3: 转换反斜杠分隔符到美元符号
  // 块级公式: \[ ... \] 转换为 $$ ... $$
  processedContent = processedContent.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (match, content) => {
      return `$$${content}$$`;
    }
  );

  // 行内公式: \( ... \) 转换为 $ ... $
  // 修复：使用更严格的匹配，避免跨行匹配和包含中文字符
  processedContent = processedContent.replace(
    /\\\(([^)]*?)\\\)/g,
    (match, content) => {
      // 如果内容包含中文字符或者太长，很可能不是数学公式
      if (/[\u4e00-\u9fff]/.test(content) || content.length > 100) {
        return match; // 保持原样，不转换
      }
      return `$${content}$`;
    }
  );

  // 步骤4: 恢复LaTeX表达式
  processedContent = processedContent.replace(
    /<<LATEX_(\d+)>>/g,
    (_, index) => latexExpressions[parseInt(index)]
  );

  // 步骤5: 恢复代码块
  processedContent = processedContent.replace(
    /<<CODE_BLOCK_(\d+)>>/g,
    (_, index) => codeBlocks[parseInt(index)]
  );

  return processedContent;
}

// 测试用例
const testCases = [
  {
    input: "This is inline math: \\( E = mc^2 \\)",
    expected: "This is inline math: $ E = mc^2 $",
  },
  {
    input: "Block math:\\[ F = ma \\]",
    expected: "Block math:$$ F = ma $$",
  },
  {
    input: "Mixed: \\( a = 1 \\) and \\[ b = 2 \\]",
    expected: "Mixed: $ a = 1 $ and $$ b = 2 $$",
  },
  {
    input: "Already correct: $x = 1$ and $$y = 2$$",
    expected: "Already correct: $x = 1$ and $$y = 2$$",
  },
  {
    input: "Code with math: `\\( not math \\)` and \\( real math \\)",
    expected: "Code with math: `\\( not math \\)` and $ real math $",
  },
  {
    input: "Chinese text with \\( 斜率为 \\) should not be converted",
    expected: "Chinese text with \\( 斜率为 \\) should not be converted",
  },
  {
    input: "Valid math: \\( a = b \\) and invalid: \\( 包含中文的内容 \\)",
    expected: "Valid math: $ a = b $ and invalid: \\( 包含中文的内容 \\)",
  },
];

console.log("🧪 Testing LaTeX preprocessor...\n");

testCases.forEach((testCase, index) => {
  const result = preprocessLaTeX(testCase.input);
  const passed = result === testCase.expected;

  console.log(`Test ${index + 1}: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`Input:    ${testCase.input}`);
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Got:      ${result}`);
  console.log("");
});

console.log("✨ Test completed!");
