"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { Spinner } from "@/components/ui/spinner";
import { clearChats } from "@/app/chat/lib/db/actions";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface ClearHistoryActionProps {
  empty: boolean;
}

export function ClearHistoryAction({ empty }: ClearHistoryActionProps) {
  const [isPending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const onClear = () =>
    start(async () => {
      const res = await clearChats();
      res.error ? toast.error(res.error) : toast.success("操作成功");
      setOpen(false);
      setDropdownOpen(false); // 关闭下拉菜单
      window.dispatchEvent(new CustomEvent("chat-history-updated"));

      if (pathname && pathname.startsWith("/chat/") && pathname !== "/chat") {
        router.push("/chat");
      }
    });

  return (
    <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <SidebarGroupAction disabled={empty} className="static size-7 p-1">
          <MoreHorizontal size={16} />
          <span className="sr-only">History Actions</span>
        </SidebarGroupAction>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              disabled={empty || isPending}
              className="items-cente flex gap-2 text-destructive focus:text-destructive"
              onSelect={(event) => event.preventDefault()} // Prevent closing dropdown
            >
              <Trash2 size={14} className="text-destructive" /> 清空历史对话
            </DropdownMenuItem>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>您确定吗?</AlertDialogTitle>
              <AlertDialogDescription>
                此操作不能撤消。它将永久删除您的历史对话。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
              <AlertDialogAction disabled={isPending} onClick={onClear}>
                {isPending ? <Spinner /> : "确认"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
