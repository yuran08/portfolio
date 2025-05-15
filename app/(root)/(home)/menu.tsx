"use client";

import Link from "next/link";
import React, { unstable_ViewTransition as ViewTransition } from "react";
import { links } from "./config";
import { useSelectPage } from "./use-select-page";

export default function Menu() {
  return (
    <nav className="fixed right-8 bottom-8 flex flex-col gap-2 text-center">
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
      <Link className="block text-xl font-bold uppercase" href={link.href}>
        {link.label}
      </Link>
    </ViewTransition>
  );
};
