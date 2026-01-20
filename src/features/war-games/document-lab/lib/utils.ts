import type { DocumentType } from "./types"

// Helper to determine file type from filename
export function getFileType( fileName: string ): DocumentType | null {
  const ext = fileName.split( "." ).pop()?.toLowerCase()
  switch ( ext ) {
    case "pdf":
      return "pdf"
    case "docx":
      return "docx"
    case "txt":
      return "txt"
    default:
      return null
  }
}
