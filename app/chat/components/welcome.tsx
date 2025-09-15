export default function Welcome() {
  return (
    <div className="mb-8 text-center">
      {/* 标题 */}
      <h1 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl dark:text-slate-200">
        开始新对话
      </h1>

      {/* 描述文案 */}
      <p className="text-sm text-gray-400 sm:text-base">
        向我提问任何问题，我会尽力为您提供帮助
      </p>
    </div>
  );
}
