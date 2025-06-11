"use client";

import Link from "next/link";
import React, { unstable_ViewTransition as ViewTransition } from "react";
import { links } from "./config";
import { useSelectPage } from "./use-select-page";

export default function Menu() {
  return (
    <nav className="fixed right-4 bottom-4 flex flex-col gap-1.5 text-center sm:right-6 sm:bottom-6 sm:gap-2 lg:right-8 lg:bottom-8">
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
      <Link
        href={link.href}
        className="group relative block overflow-hidden px-2 py-1 text-base font-bold uppercase focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring sm:text-lg lg:text-xl"
      >
        {/* Animated rectangle for hover effect */}
        <span
          className="absolute top-0 left-0 h-full w-full origin-left scale-x-0 transform bg-primary transition-transform duration-300 ease-in-out group-hover:scale-x-100"
          aria-hidden="true"
        />
        {/* Link text - ensure it's above the rectangle and changes color on hover */}
        <span className="relative z-10 transition-colors duration-300 ease-in-out group-hover:text-primary-foreground">
          {link.label}
        </span>
      </Link>
    </ViewTransition>
  );
};
