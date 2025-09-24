"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-2 px-8 pt-2 pb-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-6 w-full" />
    </div>
  );
}
