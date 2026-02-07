# E-Barangay System

A web-based incident and complaint management system for Philippine barangays (local government units). The system streamlines the process of filing complaints (blotter), reporting incidents, tracking case statuses, and visualizing incident data on a map.

## Tech Stack

- **React 19** - Frontend framework
- **React Router DOM** - Client-side routing
- **Tailwind CSS 3** - Utility-first styling
- **Create React App** - Build tooling

## Project Structure

```
E-Barangay-System/
└── Incident-Subsystem/          # Main React application
    ├── public/                  # Static assets & custom fonts
    ├── src/
    │   ├── components/
    │   │   ├── shared/          # Reusable components (Layout, Header, Sidebar, etc.)
    │   │   ├── sub-system-1/    # Placeholder
    │   │   ├── sub-system-2/    # Placeholder
    │   │   └── sub-system-3/    # Incident & Complaint components
    │   ├── pages/
    │   │   └── sub-system-3/    # Main application pages
    │   ├── hooks/               # Custom React hooks
    │   ├── services/            # API service layer (placeholder)
    │   └── App.js               # Root component & routing
    ├── tailwind.config.js
    └── package.json
```

## Features

### Complaint Filing (Blotter)
- Multi-step form for filing formal barangay complaints
- File upload support for evidence/attachments

### Incident Reporting
- 4-step guided form: Basic Info → Incident Details → People & Evidence → Review & Submit
- 10+ incident type categories with severity levels (Low, Medium, High, Critical)
- Dynamic person/witness list management
- File attachment support

### Case Management
- Dashboard view of all submitted reports
- Filter by status: Ongoing, Resolved, Rejected
- Statistics cards with report counts by status
- Detailed report modal view

### Incident Map
- Map-based visualization of reported incidents (in progress)

### E-KAP Chatbot
- FAQ-based barangay assistant chatbot
- Covers topics like document requests, complaints, schedules, and more

### Theme System
- 4 built-in themes: Blue (default), Purple, Green, Dark
- 80+ design tokens per theme
- Persisted via localStorage

### Responsive Design
- Mobile-first layout with collapsible sidebar
- Adaptive grid layouts across breakpoints

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm

### Installation

```bash
cd Incident-Subsystem
npm install
```

### Development

```bash
npm start
```

Opens the app at [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
```

### Run Tests

```bash
npm test
```

## Subsystem Architecture

The project is structured to support multiple subsystems:

| Subsystem | Status | Description |
|-----------|--------|-------------|
| Sub-system 1 | Placeholder | TBD |
| Sub-system 2 | Placeholder | TBD |
| Sub-system 3 | **Active** | Incident & Complaint Management |

## Branch Strategy

- `main` - Stable release branch
- `develop` - Integration branch
- `Subsystem3` - Active development for incident/complaint features
