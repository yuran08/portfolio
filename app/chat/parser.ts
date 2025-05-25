export default async function* ParseLLMReaderToMarkdownGenerator(
  llmReader: ReadableStreamDefaultReader<string>
) {


  while (true) {
    const { done, value } = await llmReader.read();
    if (done) break;
    yield value;
  }
}

