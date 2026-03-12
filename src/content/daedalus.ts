export const daedalusContent = {
  hero: {
    eyebrow: '// SYSTEM CLASSIFICATION: UNRESTRICTED',
    headline: 'The Architecture of Unfair Advantage.',
    body:
      'Daedalus is not a tool. It is a coherent intelligence architecture for reconnaissance, memory, and action. It replaces fragmented SaaS workflows with one governed system that thinks.',
    ctas: [
      { label: 'Initialize System', href: '/loadout', intent: 'primary' },
      { label: 'View Technical Specs', href: '#architecture', intent: 'secondary' },
    ],
  },

  thesis: {
    eyebrow: '// ROLE CONSOLIDATION IN PROGRESS',
    headline: ['The end is near.', 'Mostly for people with job titles.'],
    body: [
      'Old workflow: meetings, approvals, handoffs, asset requests, and someone asking who owns the final copy.',
      'New workflow: one system, explicit directives, durable memory, and outputs on demand.',
    ],
    punchline: 'We do not hire around bottlenecks. We remove them.',
  },

  architecture: {
    id: 'architecture',
    eyebrow: 'System Architecture',
    cards: [
      {
        title: 'SENTIENCE',
        role: 'Autonomous Surveillance',
        body: 'Monitors markets, targets, and movement continuously. Most companies react to signals. Sentience catches them while they are still forming.',
      },
      {
        title: 'CORTEX',
        role: 'Intelligence Memory',
        body: 'Stores dossiers, findings, extracted assets, and mission outputs. If you have to rediscover the same thing twice, your system is broken.',
      },
      {
        title: 'AUTOPILOT',
        role: 'Kinetic Response',
        body: 'Converts signals into action: drafts, pages, briefs, responses, and downstream tasks. No kickoff call required.',
      },
      {
        title: 'RELAY',
        role: 'Governance & Control',
        body: 'Permissions, review layers, audit trails, and execution boundaries. Aggression is useful. Unlogged aggression is called a lawsuit.',
      },
    ],
  },

  modules: {
    eyebrow: 'Operational Modules',
    intro:
      'User-facing labels stay operational. Implementation names stay boring. That is called discipline.',
    cards: [
      {
        label: 'Target Research',
        role: 'Ingest raw targets and generate structured dossiers.',
        primitives: 'enrich',
        outputs: [
          'Target Dossier',
          'buying signals',
          'stack and profile context',
          'mission-ready summaries',
        ],
      },
      {
        label: 'Surveillance',
        role: 'Persistent page monitoring and change detection.',
        primitives: 'observe',
        outputs: [
          'visual diffs',
          'content deltas',
          'alerts',
          'execution history',
        ],
      },
      {
        label: 'Asset Extraction',
        role: 'Extract design tokens, typography, voice, and copy systems.',
        primitives: 'extract',
        outputs: [
          'Brand DNA Profile',
          'color and font map',
          'tone model',
          'reusable brand primitives',
        ],
      },
      {
        label: 'Threat Intel',
        role: 'Scheduled market reconnaissance and deduplicated signal discovery.',
        primitives: 'scout',
        outputs: [
          'new result feed',
          'watchlists',
          'alerts',
          'summarized findings',
        ],
      },
      {
        label: 'Counter Ops',
        role: 'Turn intelligence into a response.',
        primitives: 'agent',
        outputs: [
          'kill sheets',
          'campaign briefs',
          'landing page fabrication',
          'action payloads',
        ],
      },
    ],
  },

  ballistics: {
    eyebrow: '// UPGRADE: BALLISTICS PACKAGE v2.5',
    headline: 'Multi-Vector Strike Capability.',
    body:
      'Daedalus solves the two biggest constraints in intelligence collection: detection and scale.',
    cards: [
      {
        name: 'Ghost Protocol',
        mission: 'Infiltration',
        tech: 'Firecrawl Stealth Browser + agent integration',
        quote: 'Most agents get stopped at the gate. Ours walk through walls.',
        body: 'Use Ghost Protocol for high-friction targets, stealth access, JavaScript-heavy pages, and contested environments.',
        capability: 'Undetectable Surveillance',
      },
      {
        name: 'Swarm Engine',
        mission: 'Saturation',
        tech: 'Hyper Browser Infrastructure',
        quote: 'One agent is a probe. A thousand is coverage.',
        body: 'Use Swarm Engine for parallel sweeps, high-volume extraction, market mapping, and time-on-target raids across large surfaces.',
        capability: 'Convergent Operations',
      },
    ],
    closing:
      'Ghost Protocol breaches the perimeter. Swarm Engine floods the terrain. Different warheads. Same objective.',
  },

  acquisition: {
    eyebrow: 'Acquire Daedalus',
    headline: 'How to Acquire Daedalus.',
    body: 'Hosted if you want speed. Private deployment if you want sovereignty.',
    tiers: [
      {
        name: 'Observer',
        price: '$0',
        period: '/mo',
        description: 'Limited access to test the stack and inspect the interface.',
        cta: { label: 'Run Demo', href: '/brand-recon' },
      },
      {
        name: 'Operator',
        price: '$30',
        period: '/mo',
        description: 'Full access to the hosted system for research, surveillance, extraction, and memory workflows.',
        cta: { label: 'Deploy Operator', href: '/loadout' },
        highlight: true,
      },
      {
        name: 'Skunkworks',
        price: 'Custom',
        period: '',
        description: 'Private deployment, custom agents, architecture support, and system design for serious operators.',
        cta: { label: 'Request Audit', href: '/loadout' },
      },
    ],
  },

  footerCta: {
    headline: 'Stop staffing around friction. Start deploying systems.',
    body:
      'If your workflow depends on six specialists, three approvals, and somebody finding the latest logo export, you do not have a workflow. You have a ritual.',
    ctas: [
      { label: 'Initialize System', href: '/loadout', intent: 'primary' },
      { label: 'Request Audit', href: '/loadout', intent: 'secondary' },
    ],
  },
} as const

export type DaedalusContent = typeof daedalusContent
