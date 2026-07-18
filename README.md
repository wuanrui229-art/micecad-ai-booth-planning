# MICECAD AI Booth Planning

MICECAD AI Booth Planning is a bilingual interactive course MVP for exhibition booth planning. It demonstrates a coarse-to-fine workflow in which a venue plan and planning brief become visible constraints, an editable zoning and circulation draft, alternative booth layouts, object-level revisions, deterministic rule evidence and a professional drafting handoff.

> **Project boundary:** this repository contains the latest interactive web prototype only. It is not a regulatory compliance system, a production CAD kernel, or an official MICECAD/ExpoCloud integration.

## Live Prototype

[Open the hosted MICECAD AI prototype](https://micecad-ai-booth-planner.wuanrui229.chatgpt.site)

The hosted site may require authorized workspace access. The repository can also be run locally using the steps below.

## MVP Capabilities

- Chinese and English interface switching.
- Planning brief entry plus an explicit venue-plan requirement.
- Upload of a venue plan or deliberate selection of the N3 course-demo plan before layout generation is enabled.
- Explicit confirmation of inferred hard constraints and preferences.
- A separate zoning and circulation stage before any booth layout is generated.
- Editable bidirectional, clockwise and counter-clockwise circulation preferences, clearly separated from fire-safety rules.
- Comparison of three explainable planning alternatives.
- Color-coded zoning and circulation-overlay views for discussion and handoff preview.
- Professional booth-object workspace with geometry, type, status, price and version information.
- Bounded natural-language revision demo: split booths A101 and A103 into eight standard booths while preserving sold inventory.
- Before/after object diff and approval before version V3 is created.
- Live recalculation of representative boundary, overlap, aisle, numbering, sold-booth and booth-mix rules.
- Object-level version history and restoration.
- Demonstration export of current booth data as CSV and simplified DXF.
- Explicit professional-handoff preview without sending an external task.

## Demonstration Flow

1. Describe the planning task.
2. Upload a venue plan or explicitly choose the N3 course-demo plan as the spatial reference.
3. Confirm the recognized venue information and the constraints interpreted by the system.
4. Review the proposed zone allocation and circulation structure.
5. Select a circulation preference and confirm the coarse spatial structure.
6. Compare booth alternatives that share the same venue geometry, zoning draft and hard constraints.
7. Open the professional workspace and switch between booth, zone and circulation views.
8. Submit the supported sample revision and review the object-level difference.
9. Create version V3 and inspect recalculated rule evidence.
10. Export the current object data or open the drafting-handoff preview.

## Technology

- TypeScript
- React 19
- Next.js 16 application structure
- Vinext and Vite
- Cloudflare-compatible runtime tooling
- Plain CSS for the CAD-style workspace and responsive presentation

## Local Development

### Prerequisites

- Node.js 22.13 or later
- npm

### Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

### Validate the project

```bash
npm run build
npm test
npm run lint
```

## Project Structure

```text
app/
  page.tsx              Main bilingual planning workflow and MVP interactions
  globals.css           Application and CAD-workspace styling
  layout.tsx            Page metadata and root layout
build/                   Local Sites/Vite integration helper
db/                      Optional database scaffold; unused by the current MVP
public/                  Icons and social-preview images
tests/                   Source-level MVP contract checks
worker/                  Cloudflare-compatible worker entry
```

## What Is Executable in This Repository

The current site implements the interface workflow, booth-object state changes, version restoration, representative rule calculations and demonstration CSV/DXF export in the browser. Its supported natural-language edit is intentionally bounded to the documented sample operation so the complete interaction can be demonstrated reliably.

The following are not claimed by this repository:

- unrestricted PDF, image or DXF recognition;
- general-purpose layout generation from arbitrary instructions;
- official fire-safety or statutory certification;
- persistent multi-user project storage;
- production connection to MICECAD or ExpoCloud;
- evidence of professional productivity or commercial adoption.

## Responsible Use

AI-oriented explanations and recommendations in the interface are decision-support content. Hard-rule results remain visible, users approve changes, and professional staff remain responsible for final drawings and venue requirements.

Clockwise or counter-clockwise visitor flow is treated only as an editable planning preference. It is not presented as a fire-evacuation rule or proof of statutory compliance.

## Academic Context

This MVP was developed for software-engineering and business-AI coursework. The broader project report evaluates a separate research core for structured LLM output, deterministic geometry solving, independent validation and version-controlled approval. Paper files, evaluation data, model credentials and private working artifacts are intentionally excluded from this repository.

## Author

Anrui Wu  
Macau University of Science and Technology
