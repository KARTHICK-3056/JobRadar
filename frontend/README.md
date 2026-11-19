# JobRadar Frontend

A dark-first "radar / mission control" change-tracking dashboard for student internships and job listings, built with **Vite, React 19, TypeScript, Tailwind CSS, Framer Motion, Recharts, and TanStack Query**.

---

## Features

- **Mission Control Dashboard**: Live system freshness indicator, 6 animated KPI cards with deep-links, 14-day stacked velocity chart, real-time detected changes stream, and urgent deadline countdowns.
- **Search & Multi-Filter Listings**: Instant role/company/skill search, multi-criteria filter dropdowns (company, source, location, status, change category), grid / table view toggle, and filter chips that persist in URL query parameters.
- **Deep Version History Drawer**: Slide-over drawer with vertical timeline of snapshots, field-level before/after diffs (rose strikethrough vs emerald highlight), SHA-256 content hash with 1-click copy, and student application tracker.
- **Change Review Queue**: Plain-language review center with side-by-side diff comparisons, bulk verification, undo action on dismissal, and keyboard shortcuts (`J`/`K` navigation, `V` verify, `D` dismiss).
- **Kanban Application Tracker**: Drag-and-drop workflow (`@dnd-kit`) covering *Saved, Applied, Online Test, Interview, Offer, Rejected* with optimistic UI updates.
- **Sources & Runs Telemetry**: Live ATS board health monitoring, HTTP status badges, warning lists, manual crawl triggers (`Live` and `Fixture` replay), and expandable execution audit logs.
- **Empirical Evidence & Benchmark**: Interactive table of 15 labelled change detection regression cases verifying 0.0% false alerts, with 1-click CSV export.
- **Resilient Offline Architecture**: If the backend is unreachable or `VITE_USE_MOCK=true`, the frontend seamlessly falls back to realistic mock data so students never experience broken or empty states.

---

## Setup & Running

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## Configuration & Environment Variables

Create a `.env` file in `/frontend` or copy from `.env.example`:

```bash
# Backend REST API endpoint (default: http://localhost:8000)
VITE_API_BASE_URL=http://localhost:8000

# Force realistic simulated mock data (true | false)
VITE_USE_MOCK=false
```

### Switching Between Live Backend and Mock Mode
1. **Live Backend Mode**: Start the FastAPI backend at `http://localhost:8000` (e.g. `make serve` or `python -m jobradar serve`). The frontend automatically communicates with the live backend endpoints.
2. **Demo / Mock Mode**: If the backend is not running, the frontend automatically falls back to `src/lib/mock.ts` and displays a "Demo Data" badge in the navigation bar. You can also explicitly force mock data by setting `VITE_USE_MOCK=true`.

---

## Keyboard Shortcuts
- **`Cmd + K` / `Ctrl + K`**: Open command palette to jump to any page or trigger quick actions.
- **`Esc`**: Close command palette or slide-over drawer.
- **`J` / `K`**: Navigate between change items in the Review Queue.
- **`V`**: Verify selected change.
- **`D`**: Dismiss selected change as false alert.
