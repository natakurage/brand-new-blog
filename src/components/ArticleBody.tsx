import Markdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeToc from "rehype-toc";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import React from "react";
import Image from "next/image";
import LinkProcessor from "./LinkProcessor";
import "katex/dist/katex.min.css";
import { cms } from "@/lib/cms";
import CopyCodeButton from "./CopyCodeButton";

export default function ArticleBody({ content, showToc = false, className }: { content: string, showToc?: boolean, className?: string }) {
  return (
    <Markdown
      className={`prose max-w-none dark:!prose-invert break-words ${className}`}
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
        p: ({ children }) => {
          if (children == null) return null;
          // 単独の<a>を含む<p>の場合
          if (React.Children.count(children) === 1 && React.isValidElement(children) && children.type === "a") {
            const href = children.props.href;
            if (typeof href === "string") {
              return <LinkProcessor href={href}>
                {children.props.children}
              </LinkProcessor>; 
            }
          }
          const childrenContainsImg = React.Children.toArray(children).some((child) => React.isValidElement(child) && child.type === "img");
          if (!childrenContainsImg) return <p>{children}</p>;
          return (
            <figure className="relative">
              {
                React.Children.map(children, (child) => {
                  if (React.isValidElement(child)) {
                    if (child.type === "img") {
                      const { alt } = child.props;
                      let { src } = child.props;
                      if (!src.startsWith("https") && cms === "contentful") {
                        src = `https:${src}`;
                      }
                      return (
                        <Image
                          key={src}
                          src={src}
                          alt={alt ? alt : "Article Image"}
                          fill
                          sizes="100%"
                          className="object-contain !relative !w-auto mx-auto"
                        />
                      );
                    }
                    if (child.type === "em") {
                      return <figcaption className="italic text-center">{child.props.children}</figcaption>;
                    }
                  }
                  return child;
                })
              }
            </figure>
          );
        },
        pre: ({ children }) => {
          if (children == null) {
            return null;
          }
          if (
            !React.isValidElement(children)
            || children.type !== "code"
          ) {
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
          const childrenArray = React.Children.toArray(children);
          const content: React.ReactNode[] = [];
          let source = null;
          childrenArray.forEach((child) => {
            if (React.isValidElement(child) && child.props.node.tagName === "p") {
              const text = child.props.children;
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