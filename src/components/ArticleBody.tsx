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

export default function ArticleBody({ content, showToc = false }: { content: string, showToc?: boolean }) {
  return (
    <Markdown
      className="prose dark:!prose-invert break-words"
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
                      const { src, alt } = child.props;
                      return (
                        <Image
                          key={src}
                          src={`https:${src}`}
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
          const codeContent = children.props.children;
          const language = className?.replace("language-", "");
          return (
            <SyntaxHighlighter
              language={language}
              style={dracula}
            >
              {String(codeContent).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        }
      }}
    >
      {content}
    </Markdown>
  );
}