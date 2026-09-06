import { cache } from "react";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { BlogPostManager, loadGlobalSettings } from "@/lib/cms";
import { getShareInfo } from "@/lib/models";
import removeMd from "remove-markdown";

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
  const post = await getPost(slug, isEnabled);

  if (!post) {
    notFound();
  }

  const [data, shareInfo] = await Promise.all([
    loadGlobalSettings(),
    getShareInfo(post),
  ]);

  const licenseInfo = new Map<string, string>([
    ["タイトル", post.title],
    ["著者", data.author],
    ["作成年", new Date(post.createdAt).getFullYear().toString()],
    ["URL", shareInfo.url],
    ["ライセンス", post.licenseSelect ?? post.license ?? "不明なライセンス"],
  ]);
  const licenseText = Array.from(licenseInfo.entries())
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");

  const titlePrefix = isEnabled ? "(プレビュー) " : "";

  if (format === "md") {
    const fullMarkdown = `# ${titlePrefix}${post.title}\n\n${post.content}\n\n---\n\n${licenseText}\n`;

    return new Response(fullMarkdown, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }

  if (format === "txt") {
    const plainTextBody = removeMd(post.content);
    const fullPlainText = `${titlePrefix}${post.title}\n\n${plainTextBody}\n\n----------------------------------------\n${licenseText}\n`;

    return new Response(fullPlainText, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  notFound();
}