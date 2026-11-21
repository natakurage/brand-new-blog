import type { ContentSummary } from "@/lib/content/types";
import { pageCount } from "@/lib/content/pagination";
import type { Addressable } from "@/lib/content/href";
import Paginator from "./Paginator";
import ListItem from "./ListItem";
import ListExporter from "./ListExporter";
import { ORIGIN } from "@/lib/config";

// ブラウザの部品には、URL を作るのに要る識別子だけを渡す
const addressOf = ({ kind, slug }: Addressable): Addressable => ({ kind, slug });

interface ItemListProps {
  items: ContentSummary[];
  total: number;
  page: number;
  limit: number;
  // 項目をリスト・アルバムの中で見せるときの、そのリスト・アルバム
  context?: Addressable;
  showDate?: boolean;
  // 種類の違うものを混ぜて並べるときに、種類を示す
  showKind?: boolean;
  showLength?: boolean;
  hrefFor: (page: number) => string;
  showCount?: boolean;
  showExporter?: boolean;
  // 一覧の全項目。渡すと、書き出しで表示中の項目とすべての項目を選べる
  allItems?: Addressable[];
}

export default function ItemList(
  { hrefFor, items, total, page, limit, context,
    showDate = true, showLength = true, showKind = false,
    showCount = true, showExporter = true, allItems,
  }: ItemListProps
) {
  const maxPages = pageCount(total, limit);
  const currentNum = items.length + (page - 1) * limit;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between">
        {total > 0 && showCount && (
          <p className="text-sm text-base-content/70">
            {currentNum} / {total} 件
          </p>
        )}
        {showExporter && <ListExporter origin={ORIGIN} pageItems={items.map(addressOf)} allItems={allItems?.map(addressOf)} />}
      </div>
      <ul className="space-y-4">
        {items.map((item) => (item &&
          <li key={`${item.kind}:${item.slug}`}>
            <ListItem
              item={item}
              context={context}
              showDate={showDate}
              showLength={showLength}
              showKind={showKind}
            />
          </li>
        ))}
      </ul>
      <Paginator
        hrefFor={hrefFor}
        page={page}
        maxPages={maxPages}
      />
    </div>
  );
}