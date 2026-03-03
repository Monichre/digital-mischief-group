# Daedalus - Beta Testing Guide

Thanks for testing Daedalus. This doc will get you up and running and tell you what to actually try.

---

## Getting Access

You'll need an invite link. Hit up Liam if you don't have one. Sign up with your email and you're in.

**URL**: https://daedalus.digital-mischief-group.com (or whatever Liam sends you)

---

## What Is This Thing

Daedalus is a web intelligence tool. It has five core features:

| Feature | What it does |
|---------|-------------|
| **Brand Recon** | Scrapes a URL and extracts brand identity — colors, fonts, copy, logo |
| **Enrich** | Builds a dossier on a person or company |
| **Observe** | Monitors a URL and alerts you when it changes |
| **Scouts** | Runs scheduled searches and surfaces new results you haven't seen |
| **Research** | Interactive AI research sessions with tool use |

---

## Things to Try

### Brand Recon
1. Go to **Brand Recon** in the sidebar
2. Paste any public URL (e.g. `stripe.com`, `linear.app`, `vercel.com`)
3. Hit run and wait ~10–20 seconds
4. You should get back colors, fonts, brand voice, and a screenshot

**What to look for**: Does the output look accurate? Are the colors right? Does it feel complete?

---

### Enrich
1. Go to **Enrich**
2. Try a company domain (e.g. `openai.com`, `notion.so`)
3. Or try a person's name + company
4. Wait for the multi-step process to run

**What to look for**: Is the output structured and useful? Missing fields? Hallucinations?

---

### Observe
1. Go to **Observe**
2. Add a URL you want to monitor (e.g. a competitor's pricing page)
3. Set a schedule (daily, weekly)
4. Come back later or trigger a manual check

**What to look for**: Does it save? Can you trigger a manual run? Does the diff make sense?

---

### Scouts
1. Go to **Scouts**
2. Create a new scout with a search query (e.g. `"AI productivity tools 2026"`)
3. Set a frequency
4. Run it manually to see results immediately

**What to look for**: Are results relevant? Does deduplication work on subsequent runs?

---

### Research (Agent)
1. Go to **Research**
2. Start a new session
3. Ask it something like: *"What is Vercel's current positioning and who are their main competitors?"*
4. Watch it think and use tools

**What to look for**: Does it actually search the web? Are citations shown? Is the reasoning visible?

---

## How to Give Feedback

The easiest way is the **Vercel toolbar** — it shows up at the bottom of the page and lets you drop comments directly on any part of the UI. Use it to pin notes to specific elements, report visual bugs, or just leave a reaction. No need to screenshot and describe where something is.

- DM Liam directly for anything bigger or more urgent
- Screenshots are still gold for things the toolbar can't capture

## Known Rough Edges

- Some operations take 20–40 seconds — that's normal, it's hitting real APIs
- Observe and Scouts are async — scheduled runs won't fire immediately
- If something errors out, try refreshing and running again before reporting

---

*Last updated: Feb 2026*
