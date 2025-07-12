import { loadGlobalSettings } from "@/lib/contentful/globalSettings";
import Link from "next/link";
import { FaXTwitter, FaGithub, FaBluesky, FaYoutube } from "react-icons/fa6";
import { IoIosGlobe } from "react-icons/io";
import AvatarIcon from "./AvatarIcon";

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

export async function Footer() {
  const data = await loadGlobalSettings();
  return (
    <footer className="footer bg-neutral text-neutral-content p-10">
      <aside>
        <div className="flex flex-wrap gap-4">
          <AvatarIcon
            donate={data.donate}
            donateURL={data.donateUrl}
            avatar={data.avatar}
            className="w-20"
          />
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
            data.socials.map(({ name, href }) => (
              <SocialIcon key={name} site={name} href={href} />
            ))
          }
        </div>
      </nav>
    </footer>
  );
}