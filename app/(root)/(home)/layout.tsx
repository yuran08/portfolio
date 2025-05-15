import { ThemeProvider } from "next-themes";
import Header from "./header";
import Menu from "./menu";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Header />
      {children}
      <Menu />
    </ThemeProvider>
  );
}
