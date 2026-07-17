const DEFAULT_CHUNK_SIZE = 2400
const DEFAULT_OVERLAP = 280

export function chunkKnowledgeContent(
  input: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): string[] {
  const content = input.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!content) return []
  if (content.length <= chunkSize) return [content]

  const chunks: string[] = []
  let cursor = 0

  while (cursor < content.length) {
    let end = Math.min(cursor + chunkSize, content.length)

    if (end < content.length) {
      const paragraphBreak = content.lastIndexOf('\n\n', end)
      const sentenceBreak = content.lastIndexOf('. ', end)
      const preferredBreak = Math.max(paragraphBreak, sentenceBreak)
      if (preferredBreak > cursor + Math.floor(chunkSize * 0.55)) {
        end = preferredBreak + (preferredBreak === sentenceBreak ? 1 : 0)
      }
    }

    const chunk = content.slice(cursor, end).trim()
    if (chunk) chunks.push(chunk)
    if (end >= content.length) break

    cursor = Math.max(end - overlap, cursor + 1)
  }

  return chunks
}

export function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4)
}
