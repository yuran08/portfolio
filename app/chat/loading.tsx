export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
      <p className="mt-2 text-gray-500">加载中...</p>
    </div>
  );
}
