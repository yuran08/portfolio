"use client";

import ThemeToggle from "@/components/themeToggle";

export default function Header() {
  return (
    <header className="flex items-start justify-between p-4">
      <h1 className="text-6xl font-bold">HOME</h1>
      <ThemeToggle />
    </header>
  );
}
