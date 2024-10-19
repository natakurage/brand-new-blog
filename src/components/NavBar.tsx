import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";

export function NavBar() {
  return (
    <div className="navbar sticky top-0 z-50 bg-base-100 opacity-90">
      <div className="flex-1">
        <Link href="/" className="btn btn-ghost text-xl">Natakurage&apos;s blog</Link>
      </div>
      <div className="flex-none">
        <button className="btn btn-square btn-ghost">
          <GiHamburgerMenu size={24} />
        </button>
      </div>
    </div>
  );
}