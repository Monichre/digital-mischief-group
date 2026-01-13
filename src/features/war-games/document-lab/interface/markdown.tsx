import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      className={cn(
        "prose prose-neutral max-w-none text-xs leading-relaxed prose-headings:font-normal prose-headings:tracking-tight",
        "prose-h1:text-base prose-h1:font-medium prose-h2:text-sm prose-h2:font-medium prose-h3:text-xs prose-h3:font-medium prose-h4:text-xs",
        "prose-p:my-2.5 prose-a:text-foreground prose-a:underline-offset-4 prose-a:font-normal prose-a:decoration-border/60 hover:prose-a:decoration-border",
        "prose-strong:font-medium prose-strong:text-foreground",
        "prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-0.5",
        "prose-code:text-foreground prose-code:bg-muted/40 prose-code:px-1 prose-code:py-0.5 prose-code:rounded-sm prose-code:before:content-none prose-code:after:content-none prose-code:text-[10px]",
        "prose-pre:bg-muted/30 prose-pre:text-foreground prose-pre:px-3 prose-pre:py-2 prose-pre:rounded-md",
        "prose-blockquote:border-l-border/40 prose-blockquote:border-l prose-blockquote:pl-3 prose-blockquote:text-muted-foreground prose-blockquote:font-normal prose-blockquote:italic prose-blockquote:not-italic",
        "prose-hr:my-4 prose-hr:border-border/40",
        "prose-img:rounded-md",
        "prose-table:border prose-table:border-border/40 prose-table:text-[10px]",
        "prose-th:border prose-th:border-border/40 prose-th:p-2 prose-th:bg-muted/20",
        "prose-td:border prose-td:border-border/40 prose-td:p-2",
        className,
      )}
    >
      {content}
    </ReactMarkdown>
  )
}
