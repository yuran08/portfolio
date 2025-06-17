"use client";

import { ComponentPropsWithoutRef, FC, memo } from "react";

import { useCopyToClipboard } from "../lib/hooks/use-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { generateId } from "ai";
import { Check, Copy, Download } from "lucide-react";

/**
 * Recursively extracts text from a HAST node or an array of nodes.
 * @param node The node or array of nodes to extract text from.
 * @returns The concatenated text content.
 */
const getNodeText = (node: any): string => {
  if (!node) {
    return "";
  }
  if (Array.isArray(node)) {
    return node.map(getNodeText).join("");
  }
  if (typeof node === "string") {
    return node;
  }
  if (typeof node.value === "string") {
    return node.value;
  }
  if (node.children) {
    return getNodeText(node.children);
  }
  // For React components, attempt to extract from props.children
  if (node.props && node.props.children) {
    return getNodeText(node.props.children);
  }
  return "";
};

interface languageMap {
  [key: string]: string | undefined;
}

export const programmingLanguages: languageMap = {
  javascript: ".js",
  python: ".py",
  java: ".java",
  c: ".c",
  cpp: ".cpp",
  "c++": ".cpp",
  "c#": ".cs",
  ruby: ".rb",
  php: ".php",
  swift: ".swift",
  "objective-c": ".m",
  kotlin: ".kt",
  typescript: ".ts",
  go: ".go",
  perl: ".pl",
  rust: ".rs",
  scala: ".scala",
  haskell: ".hs",
  lua: ".lua",
  shell: ".sh",
  sql: ".sql",
  html: ".html",
  css: ".css",
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

const CodeBlock = ({
  inline,
  className,
  children,
  node,
  ...props
}: ComponentPropsWithoutRef<"code"> & {
  inline?: boolean;
  node?: any;
}) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 });
  const match = /language-(\w+)/.exec(className || "");
  const language = (match && match[1]) || "";

  const downloadAsFile = () => {
    if (typeof window === "undefined") {
      return;
    }
    const value = getNodeText(children).replace(/\n$/, "");
    const fileExtension = programmingLanguages[language] || ".file";
    const suggestedFileName = `file-${generateId()}${fileExtension}`;
    const fileName = window.prompt("Enter file name", suggestedFileName);

    if (!fileName) {
      // User pressed cancel on prompt.
      return;
    }

    const blob = new Blob([value], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const onCopy = () => {
    if (isCopied) return;
    const value = getNodeText(children).replace(/\n$/, "");
    copyToClipboard(value);
  };

  if (inline || language === "") {
    return (
      <code className={`inline-code ${className || ""}`} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block">
        <span className="absolute left-4 top-3 text-xs lowercase text-gray-500 dark:text-gray-400">
          {language}
        </span>
        <div className="absolute right-2 top-1.5 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={downloadAsFile}
          >
            <Download className="h-4 w-4" />
            <span className="sr-only">Download code</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onCopy}
          >
            {isCopied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
        <code className={className} {...props}>
          {children}
        </code>
      </div>
    </div>
  );
};

export default memo(CodeBlock);
