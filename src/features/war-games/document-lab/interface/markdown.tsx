import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose max-w-none text-xs leading-relaxed text-stone-200 prose-headings:font-normal prose-headings:tracking-tight",
        "prose-h1:text-base prose-h1:font-medium prose-h2:text-sm prose-h2:font-medium prose-h3:text-xs prose-h3:font-medium prose-h4:text-xs",
        "prose-p:my-2.5 prose-a:text-orange-300 prose-a:underline-offset-4 prose-a:font-normal prose-a:decoration-orange-500/40 hover:prose-a:decoration-orange-500/60",
        "prose-strong:font-medium prose-strong:text-stone-100",
        "prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-0.5",
        "prose-code:text-stone-200 prose-code:bg-black/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none prose-code:text-[10px]",
        "prose-pre:bg-black/60 prose-pre:text-stone-200 prose-pre:px-3 prose-pre:py-2 prose-pre:rounded-md prose-pre:border prose-pre:border-stone-900/80",
        "prose-blockquote:border-l-stone-700/60 prose-blockquote:border-l prose-blockquote:pl-3 prose-blockquote:text-stone-400 prose-blockquote:font-normal prose-blockquote:italic prose-blockquote:not-italic",
        "prose-hr:my-4 prose-hr:border-stone-900/80",
        "prose-img:rounded-md",
        "prose-table:border prose-table:border-stone-900/80 prose-table:text-[10px]",
        "prose-th:border prose-th:border-stone-900/80 prose-th:p-2 prose-th:bg-black/40",
        "prose-td:border prose-td:border-stone-900/80 prose-td:p-2",
        className,
      )}
    >
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}
