'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import react-markdown with SSR disabled to avoid build issues
const ReactMarkdown = dynamic(
  () => import('react-markdown').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <div className="text-sm text-gray-200">Loading...</div>
  }
)

type MarkdownMessageProps = {
  content: string
  className?: string
}

export default function MarkdownMessage({ content, className = '' }: MarkdownMessageProps) {
  const [plugins, setPlugins] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load remark-gfm on client side
    import('remark-gfm').then((mod) => {
      setPlugins([mod.default])
    })
  }, [])

  // Don't render markdown during SSR - show plain text fallback
  if (!isClient || plugins.length === 0) {
    return (
      <div className={`markdown-content ${className}`}>
        <div className="text-sm text-gray-200 whitespace-pre-wrap">{content}</div>
      </div>
    )
  }

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={plugins}
        components={{
          // Customize heading styles
          h1: ({ node, ...props }) => (
            <h1 className="text-lg font-bold text-gray-100 mb-2 mt-3 first:mt-0" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-base font-semibold text-gray-200 mb-2 mt-3 first:mt-0" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-sm font-semibold text-gray-200 mb-1 mt-2 first:mt-0" {...props} />
          ),
          // Customize paragraph styles
          p: ({ node, ...props }) => (
            <p className="text-sm text-gray-200 mb-2 last:mb-0" {...props} />
          ),
          // Customize list styles
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside space-y-1 mb-2 text-sm text-gray-200" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside space-y-1 mb-2 text-sm text-gray-200" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-sm text-gray-200" {...props} />
          ),
          // Customize code styles
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-gray-800 text-[var(--accent-clr)] text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                className="block p-2 rounded bg-gray-800 text-gray-200 text-xs font-mono overflow-x-auto mb-2"
                {...props}
              >
                {children}
              </code>
            )
          },
          // Customize link styles
          a: ({ node, href, children, ...props }: any) => (
            <a
              href={href}
              className="text-[var(--accent-clr)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),
          // Customize strong/bold styles
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-100" {...props} />
          ),
          // Customize emphasis/italic styles
          em: ({ node, ...props }) => (
            <em className="italic text-gray-300" {...props} />
          ),
          // Customize table styles
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full text-xs border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-gray-800" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="border-b border-gray-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="px-2 py-1 text-left text-gray-400 font-semibold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-2 py-1 text-gray-200" {...props} />
          ),
          // Customize blockquote styles
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-[var(--accent-clr)] pl-3 py-1 my-2 italic text-gray-300"
              {...props}
            />
          ),
          // Customize horizontal rule
          hr: ({ node, ...props }) => (
            <hr className="border-gray-700 my-3" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

