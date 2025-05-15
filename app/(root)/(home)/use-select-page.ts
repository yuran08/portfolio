"use client";

import { usePathname } from "next/navigation";

export const useSelectPage = () => {
  const pathname = usePathname();

  return pathname === "/" ? "home" : pathname.split("/")[1];
};
