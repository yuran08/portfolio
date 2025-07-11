export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex h-7 items-center sm:h-8">
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 dark:border-slate-600 dark:border-t-indigo-400 ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}
