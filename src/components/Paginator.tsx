import Link from "next/link";
import { MdFirstPage, MdLastPage } from "react-icons/md";

export default function Paginator({ page, maxPages, numPages = 5 }: { page: number, maxPages: number, numPages?: number }) {
  return (
    <div className="join flex justify-center">
      {
        page !== 1 && <Link
          className="join-item btn"
          href={"?"}
        >
          <MdFirstPage size={24} />
        </Link>
      }
      {
        Array.from({ length: numPages }).map((_, i) => {
          const current = page + i - 2;
          if (current <= 0 || current > maxPages) return null;
          const href = current === 1 ? "?" : "?page=" + current;

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
        href={"?page=" + maxPages}
      >
        <MdLastPage size={24} />
      </Link>
      }
    </div>
  );
}