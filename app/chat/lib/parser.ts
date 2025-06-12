export default async function* ParseLLMReaderToMarkdownGenerator(
  llmReader: ReadableStreamDefaultReader<string>
) {
  let buffer = ""; // 累积缓冲区
  let isMathInline = false;
  let isMathBlock = false;

  while (true) {
    const { done, value } = await llmReader.read();
    if (done) {
      // 流结束时，输出剩余的所有内容
      if (buffer) {
        yield buffer;
      }
      break;
    }

    // 将新数据添加到缓冲区
    buffer += value;

    // 检查是否包含块级数学公式开始标记 \[
    if (!isMathBlock && !isMathInline && buffer.includes("\\[")) {
      isMathBlock = true;
      // 找到开始标记，继续累积
      continue;
    }

    // 检查是否包含行内数学公式开始标记 \(
    if (!isMathInline && !isMathBlock && buffer.includes("\\(")) {
      isMathInline = true;
      // 找到开始标记，继续累积
      continue;
    }

    // 如果正在累积块级数学公式
    if (isMathBlock) {
      // 检查是否包含结束标记 \]
      if (buffer.includes("\\]")) {
        isMathBlock = false;
        // 找到完整的块级数学公式，可以输出
        yield buffer;
        buffer = "";
      } else {
        // 还没找到结束标记，继续累积
        continue;
      }
    }
    // 如果正在累积行内数学公式
    else if (isMathInline) {
      // 检查是否包含结束标记 \)
      if (buffer.includes("\\)")) {
        isMathInline = false;
        // 找到完整的行内数学公式，可以输出
        yield buffer;
        buffer = "";
      } else {
        // 还没找到结束标记，继续累积
        continue;
      }
    } else {
      // 不在数学公式中，但需要检查是否有部分开始标记
      // 检查buffer末尾是否有部分的开始标记 "\"
      if (buffer.endsWith("\\")) {
        // 可能是 \( 或 \[ 的开始，等待下一个chunk
        continue;
      } else {
        // 正常输出
        yield buffer;
        buffer = "";
      }
    }
  }
}
