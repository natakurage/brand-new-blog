import Image from "next/image";
import Link from "next/link";

interface HeaderAuthorProps {
  author: string;
  avatar: string;
  donate: string;
  donateURL: string;
  className?: string;
}

export default function HeaderAuthor({ author, avatar, donate, donateURL, className }: HeaderAuthorProps) {
  return (
  <div className={`flex flex-row gap-3 items-center ${className}`}>
    <div className="tooltip" data-tip={donate}>
      <div className="avatar">
        <div className="ring-accent hover:ring-secondary ring-offset-base-100 w-10 rounded-full ring ring-offset-0">
          <Link
            href={donateURL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src={avatar}
              alt="avatar icon"
              width={96}
              height={96}
            />
          </Link>
        </div>
      </div>
    </div>
    <span className="">{author}</span>
  </div>
  );
}