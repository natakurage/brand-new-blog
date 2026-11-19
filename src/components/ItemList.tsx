import { BlogItem } from "@/lib/content/types";
import Paginator from "./Paginator";
import ListItem from "./ListItem";
import ListExporter from "./ListExporter";
import { ORIGIN } from "@/lib/config";

interface ItemListProps {
  items: BlogItem[];
  total: number;
  page: number;
  limit: number;
  suffix?: string;
  showDate?: boolean;
  showLength?: boolean;
  basePath: string;
  useQueryParam?: boolean;
  showCount?: boolean;
  showExporter?: boolean;
}

export default function ItemList(
  { basePath, items, total, page, limit, suffix,
    showDate = true, showLength = true, useQueryParam = false,
    showCount = true, showExporter = true
  }: ItemListProps
) {
  const maxPages = Math.ceil(total / limit);
  const currentNum = items.length + (page - 1) * limit;
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between">
        {total > 0 && showCount && (
          <p className="text-sm text-base-content/70">
            {currentNum} / {total} 件
          </p>
        )}
        {showExporter && <ListExporter origin={ORIGIN} items={items} suffix={suffix} />}
      </div>
      <ul className="space-y-4">
        {items.map((item) => (item &&
          <li key={item.slug}>
            <ListItem
              item={item}
              suffix={suffix}
              showDate={showDate}
              showLength={showLength}
            />
          </li>
        ))}
      </ul>
      <Paginator
        basePath={basePath}
        page={page}
        maxPages={maxPages}
        useQueryParam={useQueryParam}
      />
    </div>
  );
}