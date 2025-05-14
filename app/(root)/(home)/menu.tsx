import Link from "next/link";


export default function Menu() {
  return (
    <nav className="fixed bottom-8 right-8 text-center flex flex-col gap-2">
      {
        [
          { href: "/", label: "Home" },
          { href: "/app", label: "App" },
        ].map(({ href, label }) => (
          <MenuLink key={href} href={href}>{label}</MenuLink>
        ))
      }
    </nav>
  );
}

const MenuLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <Link className="block font-bold text-xl" href={href}>{children}</Link>
  );
};
