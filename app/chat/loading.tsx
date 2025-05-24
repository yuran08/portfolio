export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-slate-950">
      <div className="h-16 w-16 rounded-full border-8 border-slate-300 dark:border-slate-700 border-t-slate-600 dark:border-t-indigo-400 animate-spin" />
    </div>
  );
}
