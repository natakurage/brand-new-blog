import type { Thing, WithContext } from "schema-dts";

// JSON.stringify は "<" をエスケープしないので、値に "</script>" が含まれてもスクリプトが閉じないようにする
export default function StructuredData({ data }: { data: WithContext<Thing> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
