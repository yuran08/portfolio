"use client";

import { useState } from "react";
import { Search, Check, X } from "lucide-react";

interface SearchButtonProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export const SearchButton = ({
  onSearch,
  disabled = false,
}: SearchButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setQuery("");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleCancel = () => {
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 搜索触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        title="联网搜索"
      >
        <Search className="h-4 w-4" />
        搜索
      </button>

      {/* 搜索面板 */}
      {isOpen && (
        <div className="absolute bottom-full left-0 z-50 mb-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="p-4">
            <div className="mb-3">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                联网搜索
              </label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入您想搜索的内容..."
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                autoFocus
              />
            </div>

            {/* Check按钮样式的操作按钮 */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4" />
                取消
              </button>

              <button
                onClick={handleSearch}
                disabled={!query.trim()}
                className="flex items-center gap-2 rounded-md border border-blue-500 bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-blue-500"
              >
                <Check className="h-4 w-4" />
                搜索
              </button>
            </div>

            <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                🌐 搜索互联网获取最新信息和新闻
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

// 简化版搜索组件，用于聊天输入框内
export const InlineSearchButton = ({
  onSearch,
  disabled = false,
}: SearchButtonProps) => {
  const handleClick = () => {
    const query = prompt("请输入搜索内容：");
    if (query?.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50 dark:hover:text-gray-300"
      title="联网搜索"
    >
      <Search className="h-4 w-4" />
    </button>
  );
};
