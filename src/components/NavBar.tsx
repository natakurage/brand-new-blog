import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import SearchBar from "./SearchBar";

export function NavBar() {
  return (
    <div className="navbar sticky top-0 z-50 bg-base-100 bg-opacity-90">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">Natakurage&apos;s blog</Link>
      </div>
      <div className="flex-none">
        <div className="drawer drawer-end">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">
            <label htmlFor="my-drawer" className="btn btn-square btn-ghost">
              <GiHamburgerMenu size={24} />
            </label>
          </div>
          <div className="drawer-side">
            <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
            <ul className="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content bg-opacity-100 h-full">
              <li><Link href="/">Home</Link></li>
              <li><SearchBar /></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}