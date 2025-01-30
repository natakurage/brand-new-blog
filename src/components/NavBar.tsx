"use client";

import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import SearchBar from "./SearchBar";
import { useEffect, useState } from "react";
import { MdComputer, MdDarkMode, MdLightMode, MdRssFeed } from "react-icons/md";
import data from "@/app/data/data.json";
import Image from "next/image";
import { useTheme } from "next-themes";

export function NavBar() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="navbar sticky top-0 z-50 backdrop-blur-lg">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl font-mono">
          <Image src={data.topLogo} alt="site logo" width={48} height={48} />
          <span className="hidden sm:block">{data.siteName}</span>
        </Link>
      </div>
      {
        mounted &&
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn">
            {
              theme === "light" && <MdLightMode size={24} />
            }
            {
              theme === "dark" && <MdDarkMode size={24} />
            }
            {
              theme === "system" && <MdComputer size={24} />
            }
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            <li><a onClick={() => setTheme("light")}>Light</a></li>
            <li><a onClick={() => setTheme("dark")}>Dark</a></li>
            <li><a onClick={() => setTheme("system")}>System Default</a></li>
          </ul>
        </div>
      }
      <div className={"flex-none" + (data.useSidebar ? " md:hidden" : "")}>
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