"use client";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleThemeChange = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    const x = event.clientX;
    const y = event.clientY;

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    if (!document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.style.viewTransitionName = "theme-transition";

    const transition = document.startViewTransition(() => {
      // 在这里切换主题
      // setTheme(newTheme); // 注意：setTheme 应该在动画完成或浏览器处理过渡时由 next-themes 完成
      // 我们这里主要是设置CSS变量，next-themes的setTheme会触发DOM变化，从而触发ViewTransition
    });

    await transition.ready;

    document.documentElement.style.setProperty("--clip-x", x + "px");
    document.documentElement.style.setProperty("--clip-y", y + "px");
    document.documentElement.style.setProperty("--clip-radius-start", "0px");
    document.documentElement.style.setProperty(
      "--clip-radius-end",
      endRadius + "px"
    );

    setTheme(newTheme);

    transition.finished.finally(() => {
      document.documentElement.style.removeProperty("--clip-x");
      document.documentElement.style.removeProperty("--clip-y");
      document.documentElement.style.removeProperty("--clip-radius-start");
      document.documentElement.style.removeProperty("--clip-radius-end");
      document.documentElement.style.viewTransitionName = "";
    });
  };

  return (
    <header className="absolute top-4 right-4 z-10">
      <button
        onClick={handleThemeChange}
        className="h-10 w-10 cursor-pointer rounded-full bg-gray-200 p-2 hover:bg-gray-300 dark:bg-gray-800 hover:dark:bg-gray-700"
        aria-label={
          resolvedTheme === "dark" ? "切换到亮色模式" : "切换到暗色模式"
        }
      >
        {resolvedTheme === "dark" ? (
          <Sun className="h-6 w-6" />
        ) : (
          <Moon className="h-6 w-6" />
        )}
      </button>
    </header>
  );
}
