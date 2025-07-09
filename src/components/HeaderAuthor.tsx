import AvatarIcon from "./AvatarIcon";

interface HeaderAuthorProps {
  author: string;
  avatar?: string;
  donate?: string;
  donateURL?: string;
  className?: string;
}

export default function HeaderAuthor({ author, avatar, donate, donateURL, className }: HeaderAuthorProps) {
  return (
    <div className={`flex flex-row gap-3 items-center ${className}`}>
      <AvatarIcon
        donate={donate}
        donateURL={donateURL}
        avatar={avatar}
        className="w-10"
      />
      <span className="">{author}</span>
    </div>
  );
}