export const WORKSPACE_PRIMITIVE_IDS = [
  'enrich',
  'agent',
  'extract',
  'scout',
  'observe',
] as const

export type WorkspacePrimitive = (typeof WORKSPACE_PRIMITIVE_IDS)[number]

export const WORKSPACE_SKILL_IDS = [
  'research',
  'enrich',
  'brand-recon',
  'sentinels',
  'observe',
  'weaponize-browser',
] as const

export type WorkspaceSkillId = (typeof WORKSPACE_SKILL_IDS)[number]

export type WorkspaceSkill = {
  id: WorkspaceSkillId
  primitive: WorkspacePrimitive
  label: string
  eyebrow: string
  description: string
  placeholder: string
  examples: string[]
  route: string
  queryParam: string
}

export const WORKSPACE_SKILLS: readonly WorkspaceSkill[] = [
  {
    id: 'research',
    primitive: 'agent',
    label: 'Research',
    eyebrow: 'SYNTHESIZE',
    description: 'Run a cited, multi-provider intelligence mission.',
    placeholder: 'What do you need to understand?',
    examples: [
      'Map the competitive landscape for AI browser agents',
      'Find the strongest signals in this market this week',
      'Build a sourced brief on a company before a sales call',
    ],
    route: '/research/live',
    queryParam: 'query',
  },
  {
    id: 'enrich',
    primitive: 'enrich',
    label: 'Enrich',
    eyebrow: 'DOSSIER',
    description: 'Turn a company, domain, or email into structured intelligence.',
    placeholder: 'Enter a company, domain, email, or URL',
    examples: ['stripe.com', 'OpenAI', 'founder@example.com'],
    route: '/enrich',
    queryParam: 'input',
  },
  {
    id: 'brand-recon',
    primitive: 'extract',
    label: 'Brand Recon',
    eyebrow: 'EXTRACT',
    description: 'Decode the visual system and market posture behind a URL.',
    placeholder: 'Enter the URL to inspect',
    examples: ['https://linear.app', 'https://stripe.com', 'https://vercel.com'],
    route: '/brand-recon',
    queryParam: 'input',
  },
  {
    id: 'sentinels',
    primitive: 'scout',
    label: 'Sentinels',
    eyebrow: 'MONITOR',
    description: 'Deploy a recurring search that reports only new signals.',
    placeholder: 'Describe the signal to watch for',
    examples: [
      'New AI browser automation launches',
      'Funding announcements for synthetic media startups',
      'Competitor pricing changes',
    ],
    route: '/scouts',
    queryParam: 'query',
  },
  {
    id: 'observe',
    primitive: 'observe',
    label: 'Observe',
    eyebrow: 'DIFF',
    description: 'Watch a URL and summarize meaningful page changes.',
    placeholder: 'Enter the URL to monitor',
    examples: ['https://example.com/pricing', 'https://example.com/changelog'],
    route: '/observe',
    queryParam: 'url',
  },
  {
    id: 'weaponize-browser',
    primitive: 'agent',
    label: 'Weaponize Browser',
    eyebrow: 'EXECUTE',
    description: 'Launch browser research and extraction strategies.',
    placeholder: 'Describe the browser mission',
    examples: [
      'Compare the positioning of these three competitors',
      'Summarize browser automation trends this week',
    ],
    route: '/weaponize-browser',
    queryParam: 'query',
  },
] as const

export function getWorkspaceSkill(id: WorkspaceSkillId): WorkspaceSkill {
  const skill = WORKSPACE_SKILLS.find((item) => item.id === id)
  if (!skill) throw new Error(`Unknown workspace primitive: ${id}`)
  return skill
}

export function buildWorkspaceLaunchHref(
  skillId: WorkspaceSkillId,
  prompt: string
): string {
  const skill = getWorkspaceSkill(skillId)
  const params = new URLSearchParams({[skill.queryParam]: prompt.trim()})
  return `${skill.route}?${params.toString()}`
}
