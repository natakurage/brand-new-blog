import Link from "next/link";
import { FaBluesky, FaGetPocket, FaLine, FaXTwitter } from "react-icons/fa6";
import CopyButton from "@/components/CopyButton";

export default async function ShareButtons({ shareText, shareUrl }: { shareText: string, shareUrl: string }) {
  const xShareURL = new URL("https://x.com/intent/post");
  xShareURL.searchParams.append("text", shareText);
  xShareURL.searchParams.append("url", shareUrl);

  const bskyShareURL = new URL("https://bsky.app/intent/compose");
  bskyShareURL.searchParams.append("text", `${shareText}\n${shareUrl}`);
  
  const pocketShareURL = new URL("https://getpocket.com/edit");
  pocketShareURL.searchParams.append("url", shareUrl);
  pocketShareURL.searchParams.append("title", shareText);

  const lineShareURL = new URL("https://line.me/R/msg/text");
  lineShareURL.searchParams.append("text", `${shareText}\n${shareUrl}`);

  return (
    <div className="flex flex-wrap gap-2 justify-between">
      <Link
        href={xShareURL.toString()}
        aria-label="Share to Twitter"
        target="_blank"
        className="btn  bg-black text-white flex-1"
      >
        <FaXTwitter size={24} />
      </Link>
      <Link
        href={bskyShareURL.toString()}
        aria-label="Share to Bluesky"
        target="_blank"
        className="btn bg-[#0085FF] text-white flex-1"
      >
        <FaBluesky size={24} />
      </Link>
      <Link
        href={pocketShareURL.toString()}
        aria-label="Share to Pocket"
        target="_blank"
        className="btn bg-[#ED4956] text-white flex-1"
      >
        <FaGetPocket size={24} />
      </Link>
      <Link
        href={lineShareURL.toString()}
        aria-label="Share to LINE"
        target="_blank"
        className="btn bg-[#00B900] text-white flex-1"
      >
        <FaLine size={24} />
      </Link>
      <CopyButton
        text={shareUrl}
        className="btn btn-neutral text-white flex-1"
      />
    </div>
  );
}