import Markdown from "react-markdown";

interface CreditProps {
  title: string;
  author?: string;
  artists?: string[];
  additionalInfo?: string[];
  year: number;
  license?: string;
}

export default function Credit({ title, author, artists, year, license, additionalInfo }: CreditProps) {
  return (
    <div className="border border-base-content border-dashed rounded p-3 space-y-2">
      <h6 className="font-bold">Credit</h6>
      <ul>
        <li>タイトル: {title}</li>
        { author && <li>著者: {author}</li> }
        { artists && artists.length > 0 && <li>アーティスト: {artists.join(", ")}</li> }
        { additionalInfo && additionalInfo.length > 0 && additionalInfo.map((info, index) => (
          <li key={index}>{info}</li>
        )) }
        <li>作成年: {year}</li>
      </ul>
      <h6 className="font-bold">License</h6>
      {license == null
        ? <p>ライセンスが不明です。</p>
        : <Markdown className="prose dark:!prose-invert break-words">{license}</Markdown>
      }
    </div>
  );
}
