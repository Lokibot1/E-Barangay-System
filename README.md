# E-Barangay System

A web-based barangay management platform for Brngy. Bagbag, Novaliches, Quezon City. The system integrates resident information management, document services, incident and complaint handling, case tracking, and map-based visualization into a unified interface.

> **Note:** `Incident-Subsystem/` is the main project structure for the entire E-Barangay System — all subsystems are consolidated inside it. The `D_S/` folder is a separate, standalone prototype for Document Services that has been integrated into `Incident-Subsystem/`.

---

## Tech Stack

### Incident-Subsystem (Main App)
- **React 19.2.4** — Frontend framework
- **React Router DOM 7.13.0** — Client-side routing
- **Tailwind CSS 3.4.19** — Utility-first styling
- **Vite 6.0.0** — Build tooling
- **Leaflet 1.9.4 / React Leaflet 5.0.0** — Interactive incident map
- **Leaflet.heat** — Heatmap layer for analytics
- **Recharts 3.7.0 / Chart.js 4.5.1 / react-chartjs-2** — Analytics charts
- **jsPDF 4.2.0 / jsPDF-AutoTable 5.0.7** — PDF report export
- **html2canvas 1.4.1** — Screenshot/canvas export
- **html5-qrcode 2.3.8 / qrcode.react 4.2.0** — QR code scanning and generation
- **SweetAlert2 11.26.22** — Alert dialogs
- **Lucide React 0.575.0** — Icon library
- **Axios 1.13.6** — HTTP client

### D_S (Document Services Standalone — Legacy)
- **React 19.2.0**, **React Router DOM 7.13.0**, **Tailwind CSS 4.1.18**, **Vite 7.2.4**, **SweetAlert2**

### Backend APIs
| Subsystem | API | Port |
|-----------|-----|------|
| Sub-system 3 — Incident & Complaint | Incident API | 8000 |
| Sub-system 2 — Document Services | Documents API | 8001 |
| Sub-system 1 — Resident System | Resident API | 8002 |
| Shared Utility | PHP Utility | 80 |

---

## Project Structure

```
E-Barangay-System/
├── Incident-Subsystem/           # Main React application (http://localhost:5173)
│   ├── public/                   # Static assets & custom fonts
│   └── src/
│       ├── homepage/             # Public landing page & auth flow
│       │   ├── components/       # Hero, Navbar, Footer, Officials, Events, FAQ, etc.
│       │   ├── login/            # LogInForm, LoginPage
│       │   ├── signup/           # 4-step SignUpForm (Personal, Address, Work/Edu, Upload)
│       │   ├── services/         # authService, loginService, auditLogService
│       │   ├── hooks/            # useAuthLogic
│       │   ├── data/             # homepageData.js
│       │   ├── utils/            # DevAutoFill
│       │   ├── HomePage.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── logout.jsx
│       ├── components/
│       │   ├── shared/           # Reusable UI (Layout, Header, Sidebar, Chatbot, etc.)
│       │   ├── sub-system-1/     # Resident System components
│       │   │   ├── analytics/    # Analytics interface, heatmap, demographic/sector tabs
│       │   │   ├── common/       # Shared RS UI (Button, Table, SkeletonLoader, etc.)
│       │   │   ├── household/    # Household table, stats, modals, tabs
│       │   │   ├── residents/    # Resident table, stats, modals, detail tabs
│       │   │   └── verification/ # Verification table, filters, detail view, modals
│       │   ├── sub-system-2/     # Document Services components
│       │   │   ├── accounts/     # Transactions & payment tracking
│       │   │   ├── factors/      # Analytics charts (Operations, Volumes, Socio-Economy)
│       │   │   └── reports/      # Document request reports
│       │   └── sub-system-3/     # Incident & Complaint components
│       ├── pages/
│       │   ├── shared/           # ProfilePage
│       │   ├── sub-system-1/     # Dashboard, Residents, Households, Verification,
│       │   │                     # Certificates, Settings, Support
│       │   ├── sub-system-2/     # Document request & tracking pages (BID, COI, COR)
│       │   └── sub-system-3/     # Incident/complaint pages + admin/
│       │       └── admin/        # AdminLanding, AdminIncidentReports,
│       │                         # AdminAppointments, CreateAccounts
│       ├── services/
│       │   ├── shared/           # translateToTagalogService
│       │   ├── sub-system-1/     # Api, analytics, household, residents, verification
│       │   └── sub-system-3/     # incidentService, complaintService,
│       │                         # appointmentService, notificationService, customFieldService
│       ├── hooks/
│       │   ├── shared/           # useRealTimeEvents, useUserRealTimeEvents, useSound
│       │   └── sub-system-1/     # useResidents, useHousehold, useVerification,
│       │                         # useVerificationFilters, usePrinter
│       ├── context/              # LanguageContext, RealTimeContext, UserRealTimeContext,
│       │                         # BrandingContext, ThemeContext, UserContext
│       ├── utils/                # insightsEngine, avatar, branding, profilePhoto, swal
│       │   └── sub-system-1/     # documentGenerator, householdUtils, residency
│       ├── config/               # API base URL configs
│       ├── constants/            # filter.js
│       ├── mocks/                # fileMock, runtimeApi (for tests)
│       ├── tests/                # Unit tests (see Testing section)
│       ├── Themetokens.js        # Theme token definitions (5 themes)
│       └── App.jsx               # Root component & routing
└── D_S/                          # Document Services standalone prototype (legacy)
    └── src/
        └── components/
            ├── Admin/            # Admin dashboard, requests, analytics
            └── User/             # User forms, tracking, hero, footer
```

---

## Subsystem Architecture

| Subsystem | Status | Description |
|-----------|--------|-------------|
| Sub-system 1 | **Active** | Resident System (RS) — residents, households, verification, analytics, QR scanner, certificates |
| Sub-system 2 | **Active** | Document Services (DS) — BID, COR, COI requests |
| Sub-system 3 | **Active** | Incident & Complaint Management — reports, complaints, appointments, case tracker |

---

## Features

### Public Homepage
- Landing page with hero, officials section, services, announcements, events calendar, FAQ, and contact
- Emergency modal and floating widgets
- Multi-step resident sign-up (Personal Info → Address → Work/Education → Document Upload)
- Login with role-based redirect (residents → `/sub-system-2`, admins → `/admin`)
- Forgot password and reset password flow

### Resident System (Sub-system 1)
- Resident records management: add, view, edit, archive residents
- Household management: household profiles, family tables, housing survey data
- Identity verification queue with approval/rejection workflow and audit trail
- Analytics dashboard with tabs: Overview, Demographics, Heatmap, Registration, Sectors, Livelihood, Decision Guide
- Leaflet heatmap visualization of resident distribution
- QR code scanning for resident identification
- Certificate generation and printing
- Settings and support pages

### Document Services (Sub-system 2)
- Request Barangay ID (BID), Certificate of Indigency (COI), and Certificate of Residency (COR)
- Multi-step request forms with submission confirmation
- Per-document request status tracking
- Admin document request management and analytics
- Transaction and payment tracking

### Incident Reporting (Sub-system 3)
- 4-step guided form: Basic Info → Incident Details → People & Evidence → Review & Submit
- 10+ incident type categories with severity levels (Low, Medium, High, Critical)
- Dynamic person/witness list and file attachment support

### Complaint Filing (Sub-system 3)
- Multi-step form for filing formal barangay complaints
- File upload support for evidence and attachments

### Case Tracker (Sub-system 3)
- Dashboard view of all submitted incidents and complaints
- Filter by status: Ongoing, Resolved, Rejected
- Statistics cards with report counts by status
- Detailed report modal view

### Incident Map (Sub-system 3)
- Leaflet-based map visualization of reported incidents

### Appointments (Sub-system 3)
- Admin appointments management panel

### Admin Panel
- Real-time incident and complaint monitoring via SSE (Server-Sent Events)
- Status management with user guidance modals
- Analytics and insights dashboard
- Transaction and payment tracking
- PDF report export
- Account creation and user management
- Documents inquiry view

### E-KAP Chatbot
- FAQ-based barangay assistant covering document requests, complaints, schedules, and more

### Theme System
- 5 built-in themes: Blue (default), Purple, Green, Dark, Modern
- 80+ design tokens per theme, persisted via `localStorage`

### Multi-language Support
- English and Tagalog (Filipino) via `LanguageContext`

### Responsive Design
- Mobile-first layout with collapsible sidebar
- Adaptive grid layouts across breakpoints

---

## Routing Overview

### Public
| Route | Component |
|-------|-----------|
| `/` | HomePage |
| `/login` | LoginPage |
| `/signup` | SignUpPage |
| `/reset-password` | ResetPasswordPage |

### User (authenticated)
| Route | Component |
|-------|-----------|
| `/sub-system-2` | Document Services Main |
| `/sub-system-2/req-bid` | Request BID |
| `/sub-system-2/req-coi` | Request COI |
| `/sub-system-2/req-cor` | Request COR |
| `/sub-system-2/track-bid` | Track BID |
| `/sub-system-2/track-coi` | Track COI |
| `/sub-system-2/track-cor` | Track COR |
| `/incident-complaint` | Incident/Complaint Main |
| `/incident-complaint/file-complaint` | File Complaint |
| `/incident-complaint/incident-report` | Incident Report |
| `/incident-complaint/incident-map` | Incident Map |
| `/incident-complaint/case-management` | Case Tracker |
| `/dashboard` | Analytics Dashboard |
| `/residents` | Residents |
| `/households` | Households |
| `/verification` | Verification |
| `/certificates` | Certificates |
| `/profile` | Profile |
| `/settings` | Settings |
| `/support` | Support |

### Admin (authenticated + admin role)
| Route | Component |
|-------|-----------|
| `/admin` | Admin Landing |
| `/admin/residents` | Residents |
| `/admin/residents/add` | Add Resident |
| `/admin/households` | Households |
| `/admin/user-management` | Verification |
| `/admin/incidents` | Admin Incident Reports |
| `/admin/appointments` | Admin Appointments |
| `/admin/payments` | Accounts/Payments |
| `/admin/reports` | Analytics Dashboard |
| `/admin/documents-inquiry` | Documents Inquiry |
| `/admin/certificates` | Certificates |
| `/admin/accounts` | Create Accounts |
| `/admin/settings` | Settings |
| `/admin/profile` | Profile |
| `/admin/support` | Support |

---

## Testing

The project uses **Jest 30** with **React Testing Library** and **jsdom**.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

### Test Coverage

| Area | Files |
|------|-------|
| Sub-system 3 components | `ComplaintModal`, `DiscardConfirmModal`, `Footer`, `MainMenuCards`, `ProgressIndicator`, `ReportCard`, `TabsComponent`, `ThemeModal`, `TwoStepIncidentReportModal`, `UpdateFormModal` |
| Shared components | `ActivityLogsView`, `AdminNotificationToast`, `ChangePasswordModal`, `CheckboxField`, `ConfirmationModal`, `DatePickerField`, `DateTimeBar`, `FAQChatbot`, `FileUpload`, `ForgotPasswordModal`, `Header`, `InputField`, `Layout`, `LogoutModal`, `MapComponent`, `ModernSelectField`, `ScreenLoader`, `SelectField`, `Sidebar`, `StatCard`, `TextAreaField`, `UserNotificationToast`, `Toast` |
| Sub-system 3 services | `incidentService`, `complaintService`, `appointmentService`, `notificationService`, `customFieldService`, `loginService` |
| Hooks | `useAuthLogic` |
| Pages | `ResetPasswordPage` |

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm
- XAMPP (for backend PHP/Laravel APIs)

### Frontend (Incident-Subsystem)

```bash
cd Incident-Subsystem
npm install
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

### D_S (Document Services — Legacy Standalone)

```bash
cd D_S
npm install
npm run dev
```

### Production Build

```bash
npm run build
```

