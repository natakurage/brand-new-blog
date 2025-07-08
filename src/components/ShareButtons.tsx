import Link from "next/link";
import { FaBluesky, FaLine, FaXTwitter } from "react-icons/fa6";
import CopyButton from "@/components/CopyButton";
import { SiMisskey, SiHatenabookmark } from "react-icons/si";

interface SocialButton {
  name: string;
  url: URL;
  icon: React.ReactNode;
  className: string;
}

export default async function ShareButtons({ shareText, shareUrl, fullText }: { shareText: string, shareUrl: string, fullText?: string }) {
  const xShareURL = new URL("https://x.com/intent/post");
  xShareURL.searchParams.append("text", shareText);
  xShareURL.searchParams.append("url", shareUrl);

  const bskyShareURL = new URL("https://bsky.app/intent/compose");
  bskyShareURL.searchParams.append("text", `${shareText}\n${shareUrl}`);
  
  const misskeyShareURL = new URL("https://misskey-hub.net/share/");
  misskeyShareURL.searchParams.append("title", shareText);
  misskeyShareURL.searchParams.append("url", shareUrl);

  const hatenaShareURL = new URL("https://b.hatena.ne.jp/entry/panel/");
  hatenaShareURL.searchParams.append("btitle", shareText);
  hatenaShareURL.searchParams.append("url", shareUrl);

  const lineShareURL = new URL("https://line.me/R/msg/text");
  lineShareURL.searchParams.append("text", `${shareText}\n${shareUrl}`);

  const socialButtons: SocialButton[] = [
    {
      name: "X",
      url: xShareURL,
      icon: <FaXTwitter size={24} />,
      className: "bg-black text-white flex-1"
    },
    {
      name: "Bluesky",
      url: bskyShareURL,
      icon: <FaBluesky size={24} />,
      className: "bg-[#0085FF] text-white flex-1"
    },
    {
      name: "Misskey",
      url: misskeyShareURL,
      icon: <SiMisskey size={24} />,
      className: "bg-[#B4E900] text-gray-700 flex-1"
    },
    {
      name: "はてなブックマーク",
      url: hatenaShareURL,
      icon: <SiHatenabookmark size={24} />,
      className: "bg-[#00A4FF] text-white flex-1"
    },
    {
      name: "LINE",
      url: lineShareURL,
      icon: <FaLine size={24} />,
      className: "bg-[#00B900] text-white flex-1"
    }
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-between">
      {socialButtons.map((button) => (
        <Link
          key={button.name}
          href={button.url.toString()}
          aria-label={`Share to ${button.name}`}
          target="_blank"
          className={`btn ${button.className}`}
        >
          {button.icon}
        </Link>
      ))}
      <CopyButton
        url={shareUrl}
        fullText={fullText}
        className="btn btn-neutral text-white flex-1"
      />
    </div>
  );
}