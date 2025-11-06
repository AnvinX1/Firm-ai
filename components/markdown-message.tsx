"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownMessageProps {
  content: string
  className?: string
}

export default function MarkdownMessage({ content, className }: MarkdownMessageProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-2 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-1 mt-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold mb-1">{children}</h4>,
          
          // Paragraphs
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          
          // Lists
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-2">{children}</li>,
          
          // Code blocks
          code: ({ inline, children }) => 
            inline ? (
              <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-primary/20">{children}</code>
            ) : (
              <code className="block bg-muted p-3 rounded-lg text-sm font-mono overflow-x-auto border border-border">{children}</code>
            ),
          pre: ({ children }) => <pre className="mb-2">{children}</pre>,
          
          // Links
          a: ({ href, children }) => (
            <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 bg-primary/5 pl-4 py-2 italic my-2 rounded-r">{children}</blockquote>
          ),
          
          // Strong and emphasis
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          
          // Horizontal rule
          hr: () => <hr className="my-4 border-t border-border" />,
          
          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="border-collapse border border-border">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr className="border-b border-border">{children}</tr>,
          th: ({ children }) => (
            <th className="border border-border px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}


