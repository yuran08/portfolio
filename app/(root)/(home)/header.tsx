"use client";

import React, { unstable_ViewTransition as ViewTransition } from "react";
import ThemeToggle from "@/components/themeToggle";
import { useSelectPage } from "./use-select-page";

export default function Header() {
  const currentPage = useSelectPage();

  return (
    <header className="flex items-start justify-between p-4">
      <ViewTransition name={currentPage}>
        <h1 className="text-6xl font-bold tracking-tight uppercase">
          {currentPage}
        </h1>
      </ViewTransition>
      <ThemeToggle />
    </header>
  );
}
