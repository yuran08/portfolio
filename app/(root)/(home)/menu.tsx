"use client";

import Link from "next/link";
import React, { unstable_ViewTransition as ViewTransition } from "react";
import { links } from "./config";
import { useSelectPage } from "./use-select-page";

export default function Menu() {
  return (
    <nav className="fixed bottom-8 right-8 text-center flex flex-col gap-2">
      {links.map((link) => (
        <MenuLink key={link.href} link={link} />
      ))}
    </nav>
  );
}

const MenuLink = ({ link }: { link: { href: string; label: string } }) => {
  const currentPage = useSelectPage();

  if (currentPage === link.label) return null;

  return (
    <ViewTransition name={link.label}>
      <Link className="block font-bold text-xl uppercase" href={link.href}>
        {link.label}
      </Link>
    </ViewTransition>
  );
};
