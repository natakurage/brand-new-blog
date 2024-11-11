import data from "@/app/data/data.json";

export const runtime = "nodejs";

export default function NotFound() {
  return (
    <div className="prose dark:!prose-invert">
      <h1>404 Not Found</h1>
      <p>{data.notFoundMessage}</p>
    </div>
  );
}