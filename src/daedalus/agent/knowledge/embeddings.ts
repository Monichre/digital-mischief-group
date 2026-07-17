const EMBEDDING_MODEL = 'text-embedding-3-small'

type EmbeddingResponse = {
  data?: Array<{embedding?: number[]}>
}

export async function createKnowledgeEmbeddings(
  inputs: string[]
): Promise<number[][] | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || inputs.length === 0) return null

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({model: EMBEDDING_MODEL, input: inputs}),
    })

    if (!response.ok) {
      throw new Error(`Embedding request failed with ${response.status}`)
    }

    const payload = (await response.json()) as EmbeddingResponse
    const embeddings = payload.data?.map((item) => item.embedding || []) || []

    if (embeddings.length !== inputs.length || embeddings.some((item) => item.length !== 1536)) {
      throw new Error('Embedding response did not match the requested inputs')
    }

    return embeddings
  } catch (error) {
    console.error('[knowledge] Embedding generation failed; using full-text search:', error)
    return null
  }
}
