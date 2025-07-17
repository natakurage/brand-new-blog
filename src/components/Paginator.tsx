import Link from "next/link";
import { MdFirstPage, MdLastPage } from "react-icons/md";

interface PaginatorProps {
  basePath: string;
  page: number;
  maxPages: number;
  numPages?: number;
  useQueryParam?: boolean;
}

export default function Paginator({ basePath, page, maxPages, numPages = 5, useQueryParam = false } : PaginatorProps) {
  const separator = basePath.includes("?") ? "&" : "?";
  return (
    <div className="join flex justify-center">
      {
        page !== 1 && <Link
          className="join-item btn"
          href={useQueryParam ? `${basePath}` : `${basePath}/page/1`}
        >
          <MdFirstPage size={24} />
        </Link>
      }
      {
        Array.from({ length: numPages }).map((_, i) => {
          const current = page + i - 2;
          if (current <= 0 || current > maxPages) return null;
          const href = useQueryParam ? `${basePath}${separator}page=${current}` : `${basePath}/page/${current}`;

          return <Link
            key={current}
            className={current === page ? "join-item btn btn-active" : "join-item btn"}
            href={href}
          >
            {current}
          </Link>;
        })
      }
      {
        page !== maxPages && <Link
        className="join-item btn"
        href={useQueryParam ? `${basePath}${separator}page=${maxPages}` : `${basePath}/page/${maxPages}`}
      >
        <MdLastPage size={24} />
      </Link>
      }
    </div>
  );
}