"use client";

import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import SearchBar from "./SearchBar";
import { useState } from "react";
import { MdRssFeed } from "react-icons/md";
import data from "@/app/data/data.json";
import Image from "next/image";

export function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="navbar sticky top-0 z-50 backdrop-blur-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-mono">
          <Image src={data.topLogo} alt="site logo" width={48} height={48} />
          <span className="hidden sm:block">{data.siteName}</span>
        </Link>
      </div>
      <div className={"flex-none" + (data.useSidebar ? "md:hidden" : "")}>
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
                data.navbarPages.map(({ name, href }) => (
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
              <li className="flex flex-row">
                <Link href="/rss">
                  <MdRssFeed size={24} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}