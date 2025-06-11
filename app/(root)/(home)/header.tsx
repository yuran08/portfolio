"use client";

import React, { unstable_ViewTransition as ViewTransition } from "react";
import { useSelectPage } from "./use-select-page";

export default function Header() {
  const currentPage = useSelectPage();

  return (
    <div className="absolute top-4 left-4 z-10 sm:top-8 sm:left-8">
      <ViewTransition name={currentPage}>
        <h1 className="text-3xl font-bold tracking-tight uppercase sm:text-4xl md:text-5xl lg:text-6xl">
          {currentPage}
        </h1>
      </ViewTransition>
    </div>
  );
}
