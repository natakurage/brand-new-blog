import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeToc from "rehype-toc";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ElementType, isValidElement, ReactElement, ComponentProps, Children } from "react";
import Image from "next/image";
import { isElement } from "hast-util-is-element";
import LinkProcessor from "./LinkProcessor";
import "katex/dist/katex.min.css";
import CopyCodeButton from "./CopyCodeButton";

function isElementOfType<T extends ElementType>(node: React.ReactNode, tagName: T): node is ReactElement<ComponentProps<T>, T> {
  return isValidElement(node) && node.type === tagName;
}

export default function ArticleBody({ content, showToc = false, className }: { content: string, showToc?: boolean, className?: string }) {
  return (
    <Markdown
      className={`prose max-w-none dark:prose-invert! wrap-break-word ${className}`}
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeSlug, rehypeKatex, [rehypeToc, {
        headings: ["h2", "h3"],
        customizeTOC: (toc: object) => {
          if (!showToc) return false;
          return {
            type: "element",
            tagName: "details",
            properties: { className: "collapse collapse-arrow bg-base-200" },
            children: [
              {
                type: "element",
                tagName: "summary",
                properties: { className: "collapse-title text-xl font-medium" },
                children: [
                  { type: "text", value: "目次" },
                ]
              },
              {
                type: "element",
                tagName: "div",
                properties: { className: "collapse-content" },
                children: [toc]
              }
            ]
          };
        }
      }]]}
      components={{
        a: ({ node, href, children, ...props }) => {
          const child = node?.children[0];
          if (href == null || child?.type === "text" && child.value !== href) {
            return <a href={href} {...props}>{children}</a>;
          }
          // 生のリンクのみLinkProcessorを使用
          return <LinkProcessor href={href}>{children}</LinkProcessor>;
        },
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
          // 単独の<a>を含む<p>の場合は<p>で囲まない
          const child = node?.children[0];
          if (node?.children.length === 1 && isElement(child, "a")) {
            return <>{children}</>;
          }
          const childrenContainsImg = node?.children.some((child => isElement(child, "img")));
          // 画像が含まれている場合も<p>で囲まない
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
      }}
    >
      {content}
    </Markdown>
  );
}