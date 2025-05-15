import { ThemeProvider } from "next-themes";
import Header from "./header";
import Menu from "./menu";
import ThemeToggle from "@/components/themeToggle";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ThemeToggle />

      <div className="absolute top-0 left-0 w-full">
        <Header />
      </div>

      <div className="flex min-h-screen items-center justify-center font-mono">
        {children}
      </div>

      <Menu />
    </ThemeProvider>
  );
}
