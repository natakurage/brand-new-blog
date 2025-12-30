import { BlogItem } from "@/lib/models";
import Paginator from "./Paginator";
import ListItem from "./ListItem";

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
}

export default function ItemList(
  { basePath, items, total, page, limit, suffix, showDate = true, showLength = true, useQueryParam = false }: ItemListProps
) {
  const maxPages = Math.ceil(total / limit);
  return (
    <div className="space-y-8">
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