export const homepageContent = {
  nav: {
    brand: '[ DMG ]',
    links: [
      { label: 'Daedalus', href: '#daedalus' },
      { label: 'War Games', href: '/war-games' },
      { label: 'Recon', href: '#recon' },
    ],
    reconMenu: {
      label: 'Reconnaissance Suite',
      items: [
        {
          label: 'Cortex Vault',
          href: '/cortex',
          description: 'Classified dossier library',
        },
        {
          label: 'Target Research',
          href: '/enrich',
          description: 'Company and operator intelligence dossiers',
        },
        {
          label: 'Surveillance',
          href: '/observe',
          description: 'Persistent page monitoring and change detection',
        },
        {
          label: 'Asset Extraction',
          href: '/brand-recon',
          description: 'Brand DNA, typography, voice, and design tokens',
        },
        {
          label: 'Threat Intel',
          href: '/scouts',
          description: 'Scheduled market reconnaissance and signal discovery',
        },
        {
          label: 'Counter Ops',
          href: '/brand-recon/competitive',
          description: 'Turn intelligence into pages, briefs, and response payloads',
        },
      ],
      footerLink: {
        label: 'View full system architecture',
        href: '/daedalus',
      },
    },
    cta: {
      label: 'LOADOUT →',
      href: '/loadout',
    },
  },

  hero: {
    eyebrow: '// PROTOCOL: CONTROLLED BURNS',
    headline: ['Your Data Is Cold.', 'We Bring the Matches.'],
    body:
      'Digital Mischief is a systems skunkworks. We replace specialist bottlenecks, disconnected tools, and approval-chain theater with governed AI infrastructure that actually ships.',
    proofStrip: [
      {
        tag: 'SUITE',
        label: 'Live Recon Tools',
        description: 'target research / surveillance / extraction / threat intel',
        href: '/enrich',
      },
      {
        tag: 'PROTOCOLS',
        label: 'Deployment Protocols',
        description: 'audits / playbooks / implementation paths',
        href: '/loadout',
      },
      {
        tag: 'SYSTEMS',
        label: 'Memory + Action Layer',
        description: 'governed agents / durable dossiers / operator outputs',
        href: '/daedalus',
      },
    ],
    ticker: [
      '[ SHIP ] GOVERNED RAG PIPELINES',
      '[ SHIP ] AUDITABLE AGENT WORKFLOWS',
      '[ SHIP ] PRODUCTION MEMORY LAYERS',
    ],
    ctas: [
      {
        label: '[ INITIALIZE SYSTEM ]',
        href: '/loadout',
        intent: 'primary',
      },
      {
        label: '[ RUN LIVE DEMO ]',
        href: '/enrich',
        intent: 'secondary',
      },
      {
        label: 'Request Audit',
        href: 'https://calendly.com/liam-liamellis/digital-mischief-group',
        intent: 'tertiary',
      },
    ],
  },

  problem: {
    eyebrow: '// THE FRICTION',
    headline: ['AI Everywhere.', 'Results Aren’t.'],
    body: [
      'Tribal knowledge and data silos are static. Context switching is a tax on focus, momentum, and execution. It’s fatal.',
      'Most teams do not have an intelligence problem. They have a systems problem: too many handoffs, too many approvals, too many humans acting like middleware.',
    ],
    cards: [
      {
        title: 'Intelligence Fragmentation',
        body: 'Your data exists. Your system doesn’t.',
      },
      {
        title: 'Approval Chain Latency',
        body: 'Every useful action is trapped behind meetings, handoffs, and “quick syncs.”',
      },
      {
        title: 'Pilot Graveyard',
        body: 'You are paying for AI experiments that never survive production.',
      },
    ],
    closing:
      'We build the infrastructure that eliminates the friction and forces your dormant data to go kinetic.',
  },

  warning: {
    eyebrow: '// SYSTEM ALERT: OBSOLESCENCE IMMINENT',
    headline: ['The end is near.', 'For some more than others.'],
    list: [
      'For your competitors.',
      'For your front-end guy.',
      'For your content guy.',
      'For your marketing guy.',
    ],
    body:
      'The Specialist Class is collapsing. While they are booking meetings, waiting for approvals, and asking for hex codes, we are deploying infrastructure that thinks.',
    punchline: 'Stop hiring “guys.” Start installing sentience.',
  },

  solution: {
    id: 'daedalus',
    eyebrow: '// THE WEAPON',
    headline: 'Introducing Daedalus.',
    subhead: 'Your personal military-industrial complex for marketing intelligence.',
    body:
      'We don’t sell another tool. We install a system. Daedalus turns reconnaissance into memory, memory into action, and action into operational advantage.',
    cards: [
      {
        title: 'SENTIENCE',
        subtitle: 'The Eyes',
        body: 'Continuously monitors targets, markets, and movement. If it moves, Sentience notices.',
        tag: null,
      },
      {
        title: 'CORTEX',
        subtitle: 'The Memory',
        body: 'Stores dossiers, extracted assets, research findings, signals, and comparisons. You do not rerun the mission. You retrieve the result.',
        tag: null,
      },
      {
        title: 'AUTOPILOT',
        subtitle: 'The Hands',
        body: 'Turns signals into output: briefs, landing pages, responses, drafts, and downstream actions. No waiting on the specialist supply chain.',
        tag: '> PERMISSION GRANTED: SHOOT TO KILL',
      },
      {
        title: 'RELAY',
        subtitle: 'The Brakes',
        body: 'Governance, permissions, approvals, and auditability. Because “let the agents cook” is not a compliance framework.',
        tag: null,
      },
    ],
    cta: {
      label: '[ VIEW FULL SYSTEM ARCHITECTURE ]',
      href: '/daedalus',
    },
  },

  protocol: {
    eyebrow: '// DEPLOYMENT PROTOCOL',
    headline: 'From Lab to Live in 4 Weeks.',
    body: 'We test the dangerous stuff in-house. You get the hardened version.',
    steps: [
      {
        number: '01',
        title: 'DIAGNOSTIC',
        body: 'Map the current mess: data flows, bottlenecks, latency, and handoff failures.',
      },
      {
        number: '02',
        title: 'ARCHITECTURE',
        body: 'Define the stack, interfaces, and control layer. No vibes. Actual system design.',
      },
      {
        number: '03',
        title: 'FABRICATION',
        body: 'Build the workflows, memory layer, and mission-specific agents.',
      },
      {
        number: '04',
        title: 'DEPLOYMENT',
        body: 'Install into your environment or our hosted stack.',
      },
      {
        number: '05',
        title: 'OVERWATCH',
        body: 'Monitor, refine, govern, and keep the machine from drifting into nonsense.',
      },
    ],
    closing: 'Most teams stop at the demo. We stop when it survives production.',
    cta: {
      label: '[ REQUEST SYSTEM AUDIT ]',
      href: 'https://calendly.com/liam-liamellis/digital-mischief-group',
    },
  },

  footerCta: {
    headline: 'The Specialist Class had a good run.',
    body: 'Meetings are a legacy system. Don’t build your company around them.',
    ctas: [
      {
        label: '[ INITIALIZE SYSTEM ]',
        href: '/loadout',
        intent: 'primary',
      },
      {
        label: '[ REQUEST AUDIT ]',
        href: 'https://calendly.com/liam-liamellis/digital-mischief-group',
        intent: 'secondary',
      },
    ],
    microcopy: '// Deliverable: Architecture Map + Friction Report in 48 Hours.',
  },

  footer: {
    legal: '[ DMG ] // Daedalus Systems // 2025',
    tagline: '// An Ideas Lab with Matches.',
  },
} as const

export type HomepageContent = typeof homepageContent
