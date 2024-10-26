import Image from "next/image";
import Link from "next/link";
import { FaXTwitter, FaGithub, FaBluesky, FaYoutube } from "react-icons/fa6";
import data from "@/app/data/data.json";
import { IoIosGlobe } from "react-icons/io";

function SocialIcon({ site, href }: { site: string; href: string }) {
  const icons = new Map([
    ["Website", <IoIosGlobe key={"Website"} size={24} />],
    ["Twitter", <FaXTwitter key={"Twitter"} size={24} />],
    ["GitHub", <FaGithub key={"GitHub"} size={24} />],
    ["Bluesky", <FaBluesky key={"Bluesky"} size={24} />],
    ["YouTube", <FaYoutube key={"YouTube"} size={24} />],
  ]);
  return (
    icons.has(site) && <Link
      href={href}
      aria-label={site}
      target="_blank"
      rel="noopener noreferrer"
    >
      {icons.get(site)}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="footer bg-neutral text-neutral-content p-10">
      <aside>
        <div className="flex flex-wrap gap-4">
          <div className="tooltip" data-tip={data.donate}>
            <div className="avatar">
              <div className="ring-accent hover:ring-secondary ring-offset-base-100 w-20 rounded-full ring ring-offset-2">
                <Link
                  href={data.donateURL}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={data.avatar}
                    alt="avatar icon"
                    width={96}
                    height={96}
                  />
                </Link>
              </div>
            </div>
          </div>
          <div className="max-w-md">
            <div className="font-bold">{data.author}</div>
            <p>{data.bio}</p>
          </div>
        </div>
        <p className="justify-self-center text-center">
          Copyright © {new Date().getFullYear()} {data.copyright}
        </p>
      </aside>
      <nav>
        <h6 className="footer-title">Pages</h6>
        {
          data.footerPages.map(({ name, href }) => (
            <Link key={name} href={href} className="link link-hover">
              {name}
            </Link>
          ))
        }
      </nav>
      <nav>
        <h6 className="footer-title">Social</h6>
        <div className="grid grid-flow-col gap-4">
          {
            Object.entries(data.socials).map(([site, href]) => (
              <SocialIcon key={site} site={site} href={href} /> 
            ))
          }
        </div>
      </nav>
    </footer>
  );
}