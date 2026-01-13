
# [ DAEDALUS SYSTEM MAP v2.0 ]

## SUITE A: RECON & SENTINEL

**Mission:** Aggressive data gathering and threat awareness.

| UI Nav Label (Sidebar) | Full Mission Label (Page Header) | Underlying Modules (Code) | The Job |
| :--- | :--- | :--- | :--- |
| **Research + Enrichment** | **Target Research & Data Enrichment** | `fire_enrich` | Ingest cold leads. Output deep firmographics and buying intent. |
| **Surveillance + Extraction** | **Digital Surveillance & Asset Extraction** | `brand_ext` + `observe` | Scrape brand DNA (Extraction) and watch pages for changes (Surveillance). |
| **Threat Detection** | **Intel & Competitive Threat Detection** | `scouts` / `sentinels` | Monitor competitors, news cycles, and market shifts. |
| **Counter Ops** | **Active Counter-Measures** | `response` / `autopilot` | **(NEW)** The "Action" layer. Auto-drafted replies, takedown notices, or competitive intercept campaigns. |

---

## 2.0 Detailed UI Spec (The Experience)

When the user clicks **RECON & SENTINEL** in the main nav, they see this dashboard:

### 1. Research + Enrichment

* **The Vibe:** The "Dossier" Room.
* **UI Copy:** "Upload raw targets. Receive enriched intelligence profiles."
* **Status:** `READY FOR INGEST`

### 2. Surveillance + Extraction

* **The Vibe:** The "Wiretap" Room.
* **UI Copy:** "Deploy watchers on target domains. Extract assets and track code changes."
* **Status:** `MONITORING [4] TARGETS`

### 3. Threat Detection (Intel & Competitive...)

* **The Vibe:** The "Radar" Room.
* **UI Copy:** "Scanning competitor signals. Alerting on pricing shifts, new hires, and PR moves."
* **Status:** `SILENT`

### 4. Counter Ops

* **The Vibe:** The "War Room" (The Big Red Button).
* **UI Copy:** "Active response protocols. Deploy agents to counter detected threats or engage enriched targets."
* **Status:** `AWAITING AUTHORIZATION`

---

## 3.0 The Code Structure (Don't Break The Build)

To keep this manageable, map these "Mission Labels" to your folder structure like this:

```text
/src
  /daedalus
    /recon_suite              <-- "RECON & SENTINEL"
      /research               <-- "Research + Enrichment" (Fire-Enrich)
      /surveillance           <-- "Surveillance + Extraction" (Recon + Brand)
      /threat_intel           <-- "Threat Detection" (Sentinels)
      /counter_ops            <-- "Counter Ops" (New Actions)
```

### The "Hard Truth" Audit

**"Counter Ops"** implies you can *do* something back.
If this button exists, it **must** work.

* *MVP Idea:* If you don't have autonomous agents yet, make "Counter Ops" a **Template Generator**.
  * *Example:* Threat Detection sees a competitor launch a feature -> Counter Ops auto-generates a "Battlecard" for your sales team to kill the objection.

---
