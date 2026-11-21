import { cache } from "react";
import * as v from "valibot";
import { parseParams, SlugParam } from "@/lib/params";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { repositories } from "@/lib/repositories";
import { getCreditText } from "@/lib/content/credit";
import { CALENDAR, ORIGIN } from "@/lib/config";
import { toPlainText } from "@/lib/content/summary";
import { rawFormats } from "@/lib/content/href";

const RawParams = v.strictObject({ slug: SlugParam, format: v.pipe(v.string(), v.picklist(rawFormats)) });

const getPost = cache((slug: string, isEnabled: boolean) =>
  repositories.articles.findBySlug(slug, { preview: isEnabled })
);

export async function generateStaticParams() {
  const slugs = await repositories.articles.allSlugs();
  return slugs.flatMap((slug) =>
    rawFormats.map((format) => ({
      slug,
      format,
    }))
  );
}

export async function GET(
  _request: Request,
  props: RouteContext<"/api/raw/[slug]/[format]">
) {
  const { slug, format } = parseParams(RawParams, await props.params);

  const { isEnabled } = await draftMode();
  const [data, post] = await Promise.all([
    repositories.siteSettings.get(),
    getPost(slug, isEnabled)
  ]);

  if (!post) {
    notFound();
  }

  const creditText = getCreditText(post, data.author, ORIGIN, CALENDAR);

  const titlePrefix = isEnabled ? "(プレビュー) " : "";

  switch (format) {
    case "md": {
      const fullMarkdown = `# ${titlePrefix}${post.title}\n\n${post.content}\n\n---\n\n${creditText}\n`;

      return new Response(fullMarkdown, {
        status: 200,
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
        },
      });
    }
    case "txt": {
      const plainTextBody = toPlainText(post.content);
      const fullPlainText = `${titlePrefix}${post.title}\n\n${plainTextBody}\n\n----------------------------------------\n${creditText}\n`;

      return new Response(fullPlainText, {
        status: 200,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
        },
      });
    }
    default:
      return format satisfies never;
  }
}