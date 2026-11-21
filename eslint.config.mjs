import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// 層の境界。no-restricted-imports は後に書いた設定が前のものを置き換えるので、ファイルごとに禁止を組み合わせて渡す
const sanity = {
  group: ["next-sanity", "next-sanity/*", "@sanity/*", "**/sanity", "**/sanity/**"],
  message: "Sanity は lib/sanity/ と lib/source.ts の中だけで使う",
};
const source = {
  group: ["@/lib/source", "**/source"],
  message: "CMS はキャッシュの層（lib/repositories.ts）を通して使う",
};
const domain = {
  group: ["next", "next/*", "react", "react/*", "react-dom", "server-only", "@/*", "../*"],
  message: "ドメイン（lib/content/）はフレームワークにも他の層にも依存しない",
};
const restrict = (...patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

export default defineConfig([
  {
    extends: [...nextCoreWebVitals, ...nextTypescript],
    rules: {
      semi: ["error", "always"],
    },
  },
  {
    files: ["src/**"],
    rules: restrict(sanity, source),
  },
  {
    files: ["src/lib/content/**"],
    rules: restrict(sanity, source, domain),
  },
  {
    // CMS と直接やりとりする入口（キャッシュの層、変更通知、プレビュー）
    files: ["src/lib/repositories.ts", "src/app/api/revalidate/route.ts", "src/app/api/preview/route.ts", "src/app/layout.tsx"],
    rules: restrict(sanity),
  },
  {
    files: ["src/lib/source.ts", "src/lib/sanity/**"],
    rules: { "no-restricted-imports": "off" },
  },
]);
