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
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Chat } from "@/lib/types";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useTransition } from "react";
// import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface ChatMenuItemProps {
  chat: Chat;
}

const formatDateWithTime = (date: Date | string) => {
  const parsedDate = new Date(date);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const formatTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (
    parsedDate.getDate() === now.getDate() &&
    parsedDate.getMonth() === now.getMonth() &&
    parsedDate.getFullYear() === now.getFullYear()
  ) {
    return `Today, ${formatTime(parsedDate)}`;
  } else if (
    parsedDate.getDate() === yesterday.getDate() &&
    parsedDate.getMonth() === yesterday.getMonth() &&
    parsedDate.getFullYear() === yesterday.getFullYear()
  ) {
    return `Yesterday, ${formatTime(parsedDate)}`;
  } else {
    return parsedDate.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }
};

export function ChatMenuItem({ chat }: ChatMenuItemProps) {
  const pathname = usePathname();
  const isActive = pathname.includes(chat.id);
  // const router = useRouter();
  const [isPending] = useTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const onDelete = () => {
    // startTransition(async () => {
    //   try {
    //     const res = await fetch(`/api/chat/${chat.id}`, { method: "DELETE" });
    //     if (!res.ok) {
    //       const errorData = await res.json();
    //       throw new Error(errorData.error || "Failed to delete chat");
    //     }
    //     toast.success("Chat deleted");
    //     setIsMenuOpen(false); // Close menu on success
    //     setDialogOpen(false); // Close dialog on success
    //     // If deleting the currently active chat, navigate home
    //     if (isActive) {
    //       router.push("/");
    //     }
    //     window.dispatchEvent(new CustomEvent("chat-history-updated"));
    //   } catch (error) {
    //     console.error("Failed to delete chat:", error);
    //     toast.error((error as Error).message || "Failed to delete chat");
    //     setIsMenuOpen(false); // Close menu on error
    //     setDialogOpen(false); // Close dialog on error
    //   }
    // });
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="h-auto flex-col items-start gap-0.5 p-2 pr-8"
      >
        <Link href={`/chat/${chat.id}`}>
          <div className="w-full truncate text-xs font-medium select-none">
            {chat.id}
          </div>
          <div className="w-full text-xs text-muted-foreground">
            {formatDateWithTime(chat.createdAt)}
          </div>
        </Link>
      </SidebarMenuButton>

      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction disabled={isPending} className="mr-1 size-7 p-1">
            {isPending ? (
              <div className="flex size-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <MoreHorizontal size={16} />
            )}
            <span className="sr-only">对话操作</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                disabled={isPending}
                className="gap-2 text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  // Don't call onDelete directly, just open the dialog
                }}
              >
                <Trash2 size={14} className="text-destructive" />
                删除
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>永久删除对话</AlertDialogTitle>
                <AlertDialogDescription>
                  删除后，该对话将不可恢复。确认删除吗？
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>取消</AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={onDelete} // Call onDelete here
                  className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center">
                      <Spinner />
                    </div>
                  ) : (
                    "删除"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}
