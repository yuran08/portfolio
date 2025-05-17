import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "𝓎𝓇 𝒸𝒽𝒶𝓉",
  description: "Server-driven AI chat app",
};

export default function ChatPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen bg-white text-black antialiased`}
      >
        <aside className="flex w-72 flex-col space-y-4 border-r border-gray-200 p-4">
          <h1 className="text-2xl font-bold">𝓎𝓇 𝒸𝒽𝒶𝓉</h1>
          <button className="flex w-full items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-left font-semibold text-white hover:bg-blue-700">
            <span>&#x270E;</span>
            <span>开启新对话</span>
          </button>
          <div className="flex-1 space-y-2 overflow-y-auto">
            <p className="text-xs text-gray-400">昨天</p>
            <div className="cursor-pointer truncate rounded p-2 text-sm hover:bg-gray-200">
              placeholder
            </div>
            <p className="text-xs text-gray-400">7天内</p>
            <div className="cursor-pointer truncate rounded p-2 text-sm hover:bg-gray-200">
              placeholder
            </div>
          </div>
          <div className="mt-auto border-t border-gray-200 pt-4">
            <div className="flex cursor-pointer items-center space-x-2 rounded p-2 hover:bg-gray-200">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 font-bold text-white">
                Y
              </div>
              <span className="text-sm">个人信息</span>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
