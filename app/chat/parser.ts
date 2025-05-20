export default async function* ParseLLMReaderToMarkdownGenerator(
  llmReader: ReadableStreamDefaultReader<string>
) {
  while (true) {
    const { done, value } = await llmReader.read();
    console.log(value, "response");
    if (done) break;
    // for (const char of value) {
    //   responseText += char;
    //   yield responseText;
    //   responseText = "";
    // }
    yield value;
  }
}
