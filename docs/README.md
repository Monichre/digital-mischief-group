# Digital Mischief Group - Documentation

**Last Updated**: 2026-01-10

---

## 📁 Documentation Structure

This directory contains all project documentation, organized by purpose and recency.

```
docs/
├── README.md                   # This file - documentation index
│
├── features/                   # Feature-specific documentation
│   └── war-games/             # War Games AI Sandbox feature
│
├── status-reports/             # Development progress and status
│
├── rules/                      # Coding standards and conventions
│
├── code/                       # API documentation and implementation guides
│
├── website-content/            # Marketing materials and copy
│
└── archive/                   # Historical documentation
    ├── homepage/              # Old homepage planning docs
    ├── integrations/          # Old integration plans
    ├── reviews/               # Old architecture reviews
    └── architecture/          # Old system design docs
```

---

## 🎯 Current Documentation

### Product & Planning
- **[PRD.md](../PRD.md)** - Canonical product requirements document
- **[PLAN.md](../PLAN.md)** - Implementation guide and development roadmap
- **[CLAUDE.md](../CLAUDE.md)** - Claude Code configuration and project setup

### Features in Development
- **[War Games](./features/war-games/)** - AI sandbox for pre-signup experimentation
  - Freemium onboarding feature
  - 4-5 AI workflow demonstrations
  - Conversion funnel to $30/mo PRO tier

---

## 📊 Status Reports

Track development progress and implementation status:

- **[status-reports/](./status-reports/)** - Session summaries and milestone tracking
  - Implementation status snapshots
  - Session progress reports
  - Module completion tracking

---

## 📚 Additional Resources

### Code Documentation
- **[code/](./code/)** - API documentation, implementation guides, and technical references

### Website Content
- **[website-content/](./website-content/)** - Marketing copy, landing pages, and user-facing content

### Rules & Standards
- **[rules/](./rules/)** - Coding conventions, style guides, and best practices

---

## 🗄️ Archive

Historical documentation preserved for reference:

- **[archive/homepage/](./archive/homepage/)** - Old homepage planning and pseudocode
- **[archive/integrations/](./archive/integrations/)** - Completed integration plans
- **[archive/reviews/](./archive/reviews/)** - Past architecture and implementation reviews
- **[archive/architecture/](./archive/architecture/)** - Historical system design documents

---

## 🚀 Quick Start

### For Developers
1. Read [CLAUDE.md](../CLAUDE.md) for project setup and conventions
2. Review [PLAN.md](../PLAN.md) for implementation guidance
3. Check [features/war-games/](./features/war-games/) for active feature work

### For Product/Planning
1. Start with [PRD.md](../PRD.md) for product vision and requirements
2. Review [status-reports/](./status-reports/) for current progress
3. Check [features/](./features/) for feature-specific plans

### For Content/Marketing
1. See [website-content/](./website-content/) for marketing materials
2. Review [PRD.md](../PRD.md) for product positioning
3. Check feature docs for product capabilities

---

## 📝 Documentation Guidelines

When adding new documentation:

- **Current Work**: Add to appropriate top-level directory (features/, status-reports/, code/, etc.)
- **Feature Planning**: Create subdirectory under `features/[feature-name]/`
- **Status Updates**: Add timestamped files to `status-reports/`
- **Completed Work**: Move old planning docs to `archive/` when feature is complete
- **Keep It Current**: Only active, relevant documentation should remain in root-level directories

---

**Note**: This documentation structure was reorganized on 2026-01-10 to improve navigation and maintain clarity between active and historical content.
