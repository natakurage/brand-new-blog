import Image from "next/image";
import Link from "next/link";

export default function AvatarIcon({ donate, donateURL, avatar, className }: {
  donate?: string;
  donateURL?: string;
  avatar?: string;
  className?: string;
}) {
  const avatarImage = avatar ? (
    <Image
      src={avatar}
      alt="avatar icon"
      width={96}
      height={96}
    />
  ) : null;
  return (
    <div className="tooltip" data-tip={donate}>
      <div className="avatar">
        <div className={`ring-primary hover:ring-secondary ring-offset-base-100 rounded-full ring-4 ring-offset-0 ${className}`}>
          {
            donateURL ? (
              <Link
                href={donateURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {avatarImage}
              </Link>
            ) : avatarImage
          }
        </div>
      </div>
    </div>
  );
}
