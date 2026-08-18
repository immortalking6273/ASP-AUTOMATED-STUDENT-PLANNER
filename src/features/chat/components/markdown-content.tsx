"use client";

import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

interface CodeBlockProps {
  language?: string;
  code: string;
}

function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="group relative my-3 overflow-hidden rounded-2xl border border-border/80 bg-zinc-950 dark:bg-zinc-900 shadow-md font-mono text-xs">
      {/* Code Block Header */}
      <div className="flex items-center justify-between bg-zinc-900/90 dark:bg-zinc-800/90 px-4 py-1.5 text-[11px] text-zinc-400 border-b border-zinc-800 select-none">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-zinc-300">
          <Code2 className="h-3.5 w-3.5 text-primary" />
          <span>{language || "code"}</span>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <pre className="overflow-x-auto p-4 leading-relaxed text-zinc-100 selection:bg-primary/30 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={cn("prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed text-foreground", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-4 mb-2 pb-1 border-b border-border/40">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-foreground mt-3.5 mb-1.5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm sm:text-base font-bold text-foreground mt-3 mb-1">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mt-2 mb-1">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed">{children}</p>,

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside space-y-1 my-2 pl-5 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside space-y-1 my-2 pl-5 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/70 bg-primary/5 pl-3 py-1.5 my-2.5 italic text-muted-foreground rounded-r-xl">
              {children}
            </blockquote>
          ),

          // Code blocks & Inline code
          code: ({ node, inline, className: codeClassName, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(codeClassName || "");
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && (match || codeString.includes("\n"))) {
              return <CodeBlock language={match ? match[1] : undefined} code={codeString} />;
            }

            return (
              <code
                className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] sm:text-xs font-semibold text-primary border border-border/60"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Tables
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border/70 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/80 text-foreground font-bold border-b border-border">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-border/40">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-accent/40 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2.5 font-semibold text-foreground">{children}</th>,
          td: ({ children }) => <td className="p-2.5 text-foreground">{children}</td>,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
            >
              {children}
            </a>
          ),

          // Horizontal Divider
          hr: () => <hr className="my-4 border-t border-border/60" />,

          // Emphasis
          strong: ({ children }) => <strong className="font-extrabold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
