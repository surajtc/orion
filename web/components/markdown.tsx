"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import SyntaxHighlighter from "react-syntax-highlighter";

import { googlecode } from "react-syntax-highlighter/dist/cjs/styles/hljs";

function CodeBlock({
  inline,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  inline?: boolean;
  node?: any;
}) {
  const match = /language-(\w+)/.exec(className ?? "");
  const codeString = String(children).replace(/\n$/, "");

  if (inline || !match) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  return (
    <div className="relative">
      <SyntaxHighlighter
        style={googlecode as any}
        language={match[1]}
        PreTag="div"
        customStyle={{ background: "var(--muted)" }}
        {...props}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

interface MarkdownProps {
  markdown: string;
}

function MarkdownComponent({ markdown }: MarkdownProps) {
  return (
    <div
      className="
    prose
    max-w-none
    prose-headings:font-semibold
    prose-headings:tracking-tight
    prose-headings:leading-snug
    prose-lead:text-base
    prose-pre:bg-muted
    prose-pre:px-4
    prose-pre:py-2
    leading-loose
    tracking-wide
    prose-h1:text-2xl
    prose-h2:text-xl
    prose-h3:text-lg
    prose-h4:text-base
  "
      style={{ fontSize: "0.875rem" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{ code: CodeBlock }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(
  MarkdownComponent,
  (prev, next) => prev.markdown === next.markdown,
);
