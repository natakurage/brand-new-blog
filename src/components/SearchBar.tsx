"use client";

import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";
import { MdSearch } from "react-icons/md";

export default function SearchBar({ onSubmit }: { onSubmit?: () => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.length < 2) return;
    onSubmit?.();
    router.push(`/search?q=${query}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex">
      <label className="input w-full flex items-center gap-2">
        <input
          type="text"
          className="grow w-full overflow-x-auto"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <MdSearch />
      </label>
    </form>
  );
}