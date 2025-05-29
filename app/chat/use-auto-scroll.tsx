"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseAutoScrollOptions {
  /**
   * 是否启用自动滚动
   */
  enabled?: boolean;
  /**
   * 滚动行为
   */
  behavior?: ScrollBehavior;
  /**
   * 滚动延迟（毫秒）
   */
  delay?: number;
  /**
   * 是否只在用户在底部时才自动滚动
   */
  onlyWhenAtBottom?: boolean;
  /**
   * 距离底部多少像素时认为用户在底部
   */
  bottomThreshold?: number;
}

export function useAutoScroll({
  enabled = true,
  behavior = "smooth",
  delay = 50,
  onlyWhenAtBottom = false,
  bottomThreshold = 100,
}: UseAutoScrollOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const isAutoScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userScrollPausedRef = useRef(false);

  // 检查用户是否在底部
  const isUserAtBottom = useCallback(() => {
    if (!containerRef.current) return true;

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollHeight - scrollTop - clientHeight <= bottomThreshold;
  }, [bottomThreshold]);

  // 滚动到底部
  const scrollToBottom = useCallback(
    (forceBehavior?: ScrollBehavior, forceScroll = false) => {
      if (!containerRef.current || !enabled) return;

      // 如果用户主动滚动暂停了自动滚动，且不是强制滚动，则不滚动
      if (userScrollPausedRef.current && !forceScroll) return;

      // 如果设置了只在底部时滚动，且用户不在底部，且不是强制滚动，则不滚动
      if (onlyWhenAtBottom && !isUserAtBottom() && !forceScroll) return;

      isAutoScrollingRef.current = true;

      // 清除之前的延迟滚动
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 延迟滚动，确保DOM已更新
      scrollTimeoutRef.current = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: forceBehavior || behavior,
          });
        }

        // 滚动完成后重置标志
        setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 300);
      }, delay);
    },
    [enabled, behavior, delay, onlyWhenAtBottom, isUserAtBottom]
  );

  // 立即滚动到底部（无动画，强制滚动）
  const scrollToBottomInstant = useCallback(() => {
    userScrollPausedRef.current = false;
    scrollToBottom("auto", true);
  }, [scrollToBottom]);

  // 平滑滚动到底部（强制滚动）
  const scrollToBottomSmooth = useCallback(() => {
    userScrollPausedRef.current = false;
    scrollToBottom("smooth", true);
  }, [scrollToBottom]);

  // 设置滚动容器
  const setScrollContainer = useCallback((element: HTMLElement | null) => {
    containerRef.current = element;
  }, []);

  // 自动查找滚动容器
  const findScrollContainer = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    // 向上查找可滚动的父容器
    let current = element.parentElement;
    while (current) {
      const style = window.getComputedStyle(current);
      const hasOverflow =
        style.overflowY === "auto" ||
        style.overflowY === "scroll" ||
        current.classList.contains("overflow-y-auto") ||
        current.classList.contains("overflow-auto");

      // 检查是否真的可以滚动
      if (hasOverflow) {
        containerRef.current = current;
        return;
      }
      current = current.parentElement;
    }

    // 如果没找到，使用document.documentElement
    containerRef.current = document.documentElement;
  }, []);

  // 监听用户滚动
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let userScrollTimeout: NodeJS.Timeout;
    let lastScrollTop = container.scrollTop;

    const handleScroll = () => {
      // 如果是自动滚动触发的，忽略
      if (isAutoScrollingRef.current) return;

      const currentScrollTop = container.scrollTop;

      // 检测用户是否主动向上滚动
      if (currentScrollTop < lastScrollTop) {
        // 用户向上滚动，暂停自动滚动
        userScrollPausedRef.current = true;

        // 清除之前的恢复定时器
        if (userScrollTimeout) {
          clearTimeout(userScrollTimeout);
        }

        // 3秒后恢复自动滚动（如果用户在底部）
        userScrollTimeout = setTimeout(() => {
          if (isUserAtBottom()) {
            userScrollPausedRef.current = false;
          }
        }, 3000);
      } else if (isUserAtBottom()) {
        // 用户滚动到底部，立即恢复自动滚动
        userScrollPausedRef.current = false;
        if (userScrollTimeout) {
          clearTimeout(userScrollTimeout);
        }
      }

      lastScrollTop = currentScrollTop;
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (userScrollTimeout) {
        clearTimeout(userScrollTimeout);
      }
    };
  }, [isUserAtBottom]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    scrollToBottom: scrollToBottomSmooth,
    scrollToBottomInstant,
    setScrollContainer,
    findScrollContainer,
    isUserAtBottom,
    isUserScrollPaused: () => userScrollPausedRef.current,
  };
}
