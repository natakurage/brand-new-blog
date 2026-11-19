import Link from "next/link";
import { MdFirstPage, MdLastPage } from "react-icons/md";

interface PaginatorProps {
  hrefFor: (page: number) => string;
  page: number;
  maxPages: number;
  numPages?: number;
}

export default function Paginator({ hrefFor, page, maxPages, numPages = 5 } : PaginatorProps) {
  if (maxPages <= 1) {
    return null;
  }
  return (
    <div className="join flex justify-center">
      {
        page !== 1 && <Link
          className="join-item btn"
          href={hrefFor(1)}
        >
          <MdFirstPage size={24} />
        </Link>
      }
      {
        Array.from({ length: numPages }).map((_, i) => {
          const current = page + i - 2;
          if (current <= 0 || current > maxPages) return null;
          const href = hrefFor(current);

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
        href={hrefFor(maxPages)}
      >
        <MdLastPage size={24} />
      </Link>
      }
    </div>
  );
}