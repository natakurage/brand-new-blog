import Image from "next/image";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import { FaXTwitter, FaGithub, FaBluesky, FaYoutube } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="footer bg-neutral text-neutral-content p-10">
      <aside>
        <div className="flex flex-wrap gap-4">
          <div className="tooltip" data-tip="OFUSE">
            <div className="avatar">
              <div className="ring-accent hover:ring-secondary ring-offset-base-100 w-20 rounded-full ring ring-offset-2">
                <Link
                  href="https://ofuse.me/natakurage"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/avatar.png"
                    alt="Natakurage avatar"
                    width={96}
                    height={96}
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <div className="font-bold">千本槍みなも / ナタクラゲ</div>
            <p>地獄の番人。宇宙の破壊を企んでいるが、実際は虫も殺せない社会的弱者。貧乏でNintendo Switchが買えないため資本主義を恨んでいる。ぼっちでバンドが組めないため音楽に携わるすべての人間を憎んでいる。</p>
          </div>
        </div>
        <p className="justify-self-center text-center">
          Copyright © {new Date().getFullYear()} Natakurage - Some rights reserved.
        </p>
      </aside>
      <nav>
        <h6 className="footer-title">Pages</h6>
        <Link href="/" className="link link-hover">
          Home
        </Link>
        <Link href="/articles/about" className="link link-hover">
          About
        </Link>
        <Link href="/articles/policy" className="link link-hover">
          Policy
        </Link>
      </nav>
      <nav>
        <h6 className="footer-title">Social</h6>
        <div className="grid grid-flow-col gap-4">
          <Link
            href="https://natakurage.vercel.app"
            area-label="Home"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaHome size={24} />
          </Link>
          <Link
            href="https://youtube.com/@natakurage"
            area-label="YouTube"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaYoutube size={24} />
          </Link>
          <Link
            href="https://bsky.app/profile/natakurage.bsky.social"
            area-label="Bluesky"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaBluesky size={24} />
          </Link>
          <Link
            href="https://github.com/natakurage"
            area-label="GitHub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub size={24} />
          </Link>
          <Link
            href="https://x.com/v_natakurage"
            area-label="X (Twitter)"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaXTwitter size={24} />
          </Link>
        </div>
      </nav>
    </footer>
  );
}