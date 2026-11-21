import type { ItemSummary } from "@/lib/content/types";
import { pageCount } from "@/lib/content/pagination";
import type { Addressable } from "@/lib/content/href";
import Paginator from "./Paginator";
import ListItem from "./ListItem";
import ListExporter from "./ListExporter";
import { ORIGIN } from "@/lib/config";

interface ItemListProps {
  items: ItemSummary[];
  total: number;
  page: number;
  limit: number;
  // 項目をリスト・アルバムの中で見せるときの、そのリスト・アルバム
  context?: Addressable;
  showDate?: boolean;
  showLength?: boolean;
  hrefFor: (page: number) => string;
  showCount?: boolean;
  showExporter?: boolean;
}

export default function ItemList(
  { hrefFor, items, total, page, limit, context,
    showDate = true, showLength = true,
    showCount = true, showExporter = true
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
        {showExporter && <ListExporter origin={ORIGIN} items={items} />}
      </div>
      <ul className="space-y-4">
        {items.map((item) => (item &&
          <li key={item.slug}>
            <ListItem
              item={item}
              context={context}
              showDate={showDate}
              showLength={showLength}
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