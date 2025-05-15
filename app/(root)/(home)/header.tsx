"use client";

import React, { unstable_ViewTransition as ViewTransition } from "react";
import { useSelectPage } from "./use-select-page";

export default function Header() {
  const currentPage = useSelectPage();

  return (
    <div className="absolute top-8 left-8 z-10">
      <ViewTransition name={currentPage}>
        <h1 className="text-6xl font-bold tracking-tight uppercase">
          {currentPage}
        </h1>
      </ViewTransition>
    </div>
  );
}
