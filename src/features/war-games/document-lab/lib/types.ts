// Ephemeral types for document-lab demo (no Supabase persistence)

export type DocumentType = "pdf" | "docx" | "txt"
export type DocumentStatus = "pending" | "processing" | "complete" | "error"

export interface EphemeralDocument {
  id: string
  name: string
  type: DocumentType
  size: number
  mimeType: string
  extractedText?: string
  analysis?: {
    summary?: string
    keywords?: string[]
  }
  metadata?: {
    pageCount?: number
    wordCount?: number
  }
  status: DocumentStatus
  error?: string
  createdAt: Date
}
