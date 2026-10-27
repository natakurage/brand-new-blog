import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkFlexibleToc, { TocItem } from "remark-flexible-toc";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ElementType, isValidElement, ReactElement, ComponentProps, Children } from "react";
import Image from "next/image";
import { isElement } from "hast-util-is-element";
import LinkProcessor from "./LinkProcessor";
import "katex/dist/katex.min.css";
import CopyCodeButton from "./CopyCodeButton";

const TOC_STRING = "_toc";

function isElementOfType<T extends ElementType>(node: React.ReactNode, tagName: T): node is ReactElement<ComponentProps<T>, T> {
  return isValidElement(node) && node.type === tagName;
}

export default function ArticleBody({ content, className }: { content: string, className?: string }) {
  const tocResult: TocItem[] = [];
  return (
    <div className={`prose max-w-none dark:prose-invert! wrap-break-word ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm, remarkMath, [remarkFlexibleToc, { tocRef: tocResult }]]}
        rehypePlugins={[rehypeSlug, rehypeKatex]}
        components={{
          img: ({ src, alt, title }) => {
            if (typeof src !== "string") {
              return <span>Invalid image</span>;
            }
            return (
              <figure className="relative">
                <Image
                  key={src}
                  src={src}
                  alt={alt || "Article image"}
                  fill
                  sizes="100%"
                  className="object-contain relative! w-auto! mx-auto"
                />
                {
                  title && <figcaption className="italic text-center">{title}</figcaption>
                }
              </figure>
            );
          },
          p: ({ node, children, ...props }) => {
            // 単独の<a>を含む<p>の場合
            const child = node?.children[0];
            if (node?.children.length === 1 && isElement(child, "a")) {
              const href = child.properties?.href?.toString();
              let content = null;
              if (child.children.length === 0) {
                content = href;
              } else {
                const _child = child.children[0];
                if (_child.type === "text") {
                  content = _child.value;
                }
              }
              if (href != null) {
                return <LinkProcessor href={href}>{content}</LinkProcessor>;
              }
              return <a>{content}</a>;
            }
            const childrenContainsImg = node?.children.some((child => isElement(child, "img")));
            // 画像が含まれている場合<p>で囲まない
            if (childrenContainsImg) {
              return <>{children}</>;
            };
            return <p {...props}>{children}</p>;
          },
          pre: ({ children }) => {
            if (children == null) return null;
            if (!isElementOfType(children, "code")) {
              return <pre>{children}</pre>;
            }
            const className = children.props.className;
            const codeContent = String(children.props.children).replace(/\n+$/, "");
            const language = className?.replace("language-", "");
            return (
              <div className="relative">
                <div className="absolute badge badge-neutral -top-3">{language}</div>
                <div className="absolute right-1 top-3">
                  <CopyCodeButton
                    code={codeContent}
                    className="btn btn-ghost btn-sm opacity-50"
                  />
                </div>
                <SyntaxHighlighter language={language} style={dracula}>
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            );
          },
          blockquote: ({ children }) => {
            const childrenArray = Children.toArray(children);
            const content: React.ReactNode[] = [];
            let source = null;
            childrenArray.forEach((child) => {
              if (isValidElement<{ children?: React.ReactNode }>(child)) {
                const text = child.props?.children;
                if (typeof text === "string" && text.trim().startsWith("--")) {
                  source = text.replace(/^--/, "").trim();
                } else {
                  content.push(child);
                }
              }
            });
            return (
              <figure>
                <blockquote>
                  {content}
                </blockquote>
                <figcaption className="italic text-right">
                  {source}
                </figcaption>
              </figure>
            );
          },
          h2: ({ node, children, ...props }) => {
            if (tocResult.length > 0 && children?.toString().trim() === TOC_STRING) {
              return (
                <details className="collapse collapse-arrow bg-base-200">
                  <summary className="collapse-title text-xl font-medium">目次</summary>
                  <ul className="collapse-content list-none list-inside">
                    {tocResult.map((item, index) => (
                      <li key={index} className={`toc-item toc-depth-${item.depth}`}>
                        <a href={item.href}>{item.value}</a>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            } else {
              return <h2 {...props}>{children}</h2>;
            }
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}