# E-Barangay System

A web-based barangay management platform for Philippine local government units (LGUs). The system integrates document services, incident and complaint management, case tracking, and map-based incident visualization into a unified interface.

> **Note:** The `Incident-Subsystem/` folder is the main project structure for the entire E-Barangay System — not just for incident management. All subsystems are developed and consolidated inside it. The `D_S/` folder is a separate standalone prototype for Document Services that is actively being integrated into `Incident-Subsystem/`.

## Tech Stack

### Incident-Subsystem (Main App)
- **React 19.2.4** - Frontend framework
- **React Router DOM 7.13.0** - Client-side routing
- **Tailwind CSS 3.4.19** - Utility-first styling
- **Vite 6.0.0** - Build tooling
- **Leaflet 1.9.4 / React Leaflet 5.0.0** - Interactive incident map
- **Recharts 3.7.0** - Analytics charts
- **jsPDF 4.1.0 / jsPDF-AutoTable 5.0.7** - PDF report export

### D_S (Document Services Standalone App)
- **React 19.2.0** - Frontend framework
- **React Router DOM 7.13.0** - Client-side routing
- **Tailwind CSS 4.1.18** - Utility-first styling
- **Vite 7.2.4** - Build tooling
- **SweetAlert2 11.26.18** - Alert dialogs

## Project Structure

```
E-Barangay-System/
├── Incident-Subsystem/           # Main React application
│   ├── public/                   # Static assets & custom fonts
│   └── src/
│       ├── components/
│       │   ├── shared/           # Reusable UI (Layout, Header, Sidebar, Chatbot, etc.)
│       │   ├── sub-system-1/     # Placeholder
│       │   ├── sub-system-2/     # Document Services components
│       │   │   ├── accounts/     # Transactions & payment tracking
│       │   │   ├── factors/      # Analytics charts (Operations, Volumes, Socio-Economy)
│       │   │   └── reports/      # Document request reports
│       │   └── sub-system-3/     # Incident & Complaint components
│       ├── pages/
│       │   ├── sub-system-2/     # Document request & tracking pages
│       │   └── sub-system-3/     # Incident/complaint pages + admin/
│       ├── services/
│       │   ├── shared/           # Translation service (EN/TL)
│       │   └── sub-system-3/     # Incident, complaint, login, notification services
│       ├── hooks/                # Real-time event hooks
│       ├── context/              # LanguageContext, RealTimeContext, UserRealTimeContext
│       ├── utils/                # insightsEngine.js
│       ├── Themetokens.js        # Theme token definitions
│       └── App.jsx               # Root component & routing
└── D_S/                          # Document Services standalone prototype (being integrated into Incident-Subsystem)
    └── src/
        └── components/
            ├── Admin/            # Admin dashboard, requests, analytics
            └── User/             # User forms, tracking, hero, footer
```

## Features

### Document Services (Sub-system 2)
- Request Barangay Identification (BID), Certificate of Indigency (COI), and Certificate of Residency (COR)
- Multi-step request forms with submission confirmation
- Request status tracking per document type
- Admin document request management and analytics

### Complaint Filing (Blotter)
- Multi-step form for filing formal barangay complaints
- File upload support for evidence and attachments

### Incident Reporting
- 4-step guided form: Basic Info → Incident Details → People & Evidence → Review & Submit
- 10+ incident type categories with severity levels (Low, Medium, High, Critical)
- Dynamic person/witness list management and file attachment support

### Case Tracker
- Dashboard view of all submitted incidents and complaints
- Filter by status: Ongoing, Resolved, Rejected
- Statistics cards with report counts by status
- Detailed report modal view

### Incident Map
- Leaflet-based map visualization of reported incidents

### Admin Panel
- Real-time incident and complaint monitoring
- Status management with user guidance modals
- Analytics and insights dashboard (volumes, operations, socio-economic factors)
- Transaction and payment tracking
- PDF report export

### E-KAP Chatbot
- FAQ-based barangay assistant
- Covers topics: document requests, complaints, schedules, and more

### Theme System
- 4 built-in themes: Blue (default), Purple, Green, Dark
- 80+ design tokens per theme, persisted via localStorage

### Multi-language Support
- English and Tagalog (Filipino) via `LanguageContext`

### Responsive Design
- Mobile-first layout with collapsible sidebar
- Adaptive grid layouts across breakpoints

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Incident-Subsystem

```bash
cd Incident-Subsystem
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### D_S (Document Services)

```bash
cd D_S
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

## Subsystem Architecture

| Subsystem | Status | Description |
|-----------|--------|-------------|
| Sub-system 1 | Not in scope | Not being integrated at this time |
| Sub-system 2 | **Active** | Document Services (BID, COI, COR requests) |
| Sub-system 3 | **Active** | Incident & Complaint Management |

## Branch Strategy

| Branch | Owner | Purpose |
|--------|-------|---------|
| `main` | Team | Stable release branch |
| `develop` | Team | Integration branch — all features merge here first |
| `Subsystem3` | Brian | Active development for Sub-system 3 (Incident & Complaint) |
| `alex` | Alex | Document Services (D_S) integration work |
| `riri` | Riri | Feature development |
| `ven` | Ven | Feature development |
| `SubsystemTest` | Team | Testing and experiments |
