"use client";

import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import SearchBar from "./SearchBar";
import { useState } from "react";

export function NavBar() {
  const [open, setOpen] = useState(false);

  const navbarContents = [
    {
      name: "Home",
      href: "/"
    },
    {
      name: "About",
      href: "/articles/about"
    },
    {
      name: "お知らせ",
      href: "/tags/お知らせ"
    },
    {
      name: "小説",
      href: "/tags/小説"
    }
  ];
  return (
    <div className="navbar sticky top-0 z-50 bg-base-100 bg-opacity-90">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">ナタクラゲのブログ</Link>
      </div>
      <div className="flex-none">
        <div className="drawer drawer-end">
          <input id="my-drawer" type="checkbox" checked={open} onChange={(e) => setOpen(e.target.checked)} className="drawer-toggle" />
          <div className="drawer-content">
            <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
              <GiHamburgerMenu size={24} />
            </label>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content bg-opacity-100 h-full">
              {
                navbarContents.map(({ name, href }) => (
                  <li key={name}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                    >
                      {name}
                    </Link>
                  </li>
                ))
              }
              <li><SearchBar onSubmit={() => setOpen(false)} /></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}