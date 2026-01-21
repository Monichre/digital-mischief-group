/**
 * Diff generation utilities for observe primitive
 */

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber?: number
}

export interface DiffResult {
  hasChanges: boolean
  additions: number
  deletions: number
  lines: DiffLine[]
  summary: string
}

/**
 * Generate a simple line-by-line diff between two content strings
 */
export function generateDiff(oldContent: string | null, newContent: string): DiffResult {
  if (!oldContent) {
    const lines = newContent.split('\n')
    return {
      hasChanges: true,
      additions: lines.length,
      deletions: 0,
      lines: lines.map((content, i) => ({ type: 'added', content, lineNumber: i + 1 })),
      summary: `Initial content captured (${lines.length} lines)`,
    }
  }

  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const diffLines: DiffLine[] = []
  let additions = 0
  let deletions = 0

  // Simple LCS-based diff
  const lcs = computeLCS(oldLines, newLines)
  let oldIdx = 0
  let newIdx = 0
  let lcsIdx = 0

  while (oldIdx < oldLines.length || newIdx < newLines.length) {
    if (lcsIdx < lcs.length && oldIdx < oldLines.length && oldLines[oldIdx] === lcs[lcsIdx]) {
      if (newIdx < newLines.length && newLines[newIdx] === lcs[lcsIdx]) {
        diffLines.push({ type: 'unchanged', content: lcs[lcsIdx] })
        oldIdx++
        newIdx++
        lcsIdx++
      } else if (newIdx < newLines.length) {
        diffLines.push({ type: 'added', content: newLines[newIdx], lineNumber: newIdx + 1 })
        additions++
        newIdx++
      }
    } else if (oldIdx < oldLines.length) {
      diffLines.push({ type: 'removed', content: oldLines[oldIdx], lineNumber: oldIdx + 1 })
      deletions++
      oldIdx++
    } else if (newIdx < newLines.length) {
      diffLines.push({ type: 'added', content: newLines[newIdx], lineNumber: newIdx + 1 })
      additions++
      newIdx++
    }
  }

  const hasChanges = additions > 0 || deletions > 0
  const summary = hasChanges
    ? `${additions} addition${additions !== 1 ? 's' : ''}, ${deletions} deletion${deletions !== 1 ? 's' : ''}`
    : 'No changes detected'

  return { hasChanges, additions, deletions, lines: diffLines, summary }
}

/**
 * Compute Longest Common Subsequence for diff
 */
function computeLCS(a: string[], b: string[]): string[] {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // Backtrack to find LCS
  const lcs: string[] = []
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      lcs.unshift(a[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return lcs
}

/**
 * Format diff as human-readable text
 */
export function formatDiffAsText(diff: DiffResult, maxLines = 50): string {
  const relevantLines = diff.lines
    .filter((l) => l.type !== 'unchanged')
    .slice(0, maxLines)

  if (relevantLines.length === 0) {
    return 'No changes detected.'
  }

  return relevantLines
    .map((line) => {
      const prefix = line.type === 'added' ? '+' : '-'
      return `${prefix} ${line.content}`
    })
    .join('\n')
}
