import { cache } from "react";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { BlogPostManager, loadGlobalSettings } from "@/lib/cms";
import { getCreditText } from "@/lib/content/credit";
import { ORIGIN } from "@/lib/config";
import { toPlainText } from "@/lib/content/summary";

const getPost = cache((slug: string, isEnabled: boolean) =>
  new BlogPostManager().getBySlug(slug, isEnabled)
);

export async function generateStaticParams() {
  const slugs = await new BlogPostManager().getAllSlugs();
  const formats = ["md", "txt"];

  return slugs.flatMap((slug) =>
    formats.map((format) => ({
      slug,
      format,
    }))
  );
}

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string; format: string }> }
) {
  const { slug, format } = await props.params;

  const { isEnabled } = await draftMode();
  const [data, post] = await Promise.all([
    loadGlobalSettings(),
    getPost(slug, isEnabled)
  ]);

  if (!post) {
    notFound();
  }

  const creditText = getCreditText(post, data.author, ORIGIN);

  const titlePrefix = isEnabled ? "(プレビュー) " : "";

  if (format === "md") {
    const fullMarkdown = `# ${titlePrefix}${post.title}\n\n${post.content}\n\n---\n\n${creditText}\n`;

    return new Response(fullMarkdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }

  if (format === "txt") {
    const plainTextBody = toPlainText(post.content);
    const fullPlainText = `${titlePrefix}${post.title}\n\n${plainTextBody}\n\n----------------------------------------\n${creditText}\n`;

    return new Response(fullPlainText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  notFound();
}