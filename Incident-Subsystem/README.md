# Incident Subsystem

React frontend for the E-Barangay Incident and Complaint Management System.

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## Key Directories

| Directory | Contents |
|-----------|----------|
| `src/components/shared/` | Layout, Header, Sidebar, Footer, FAQChatbot, form fields |
| `src/components/sub-system-3/` | Incident form, Complaint form, modals, report cards |
| `src/pages/sub-system-3/` | MainPage, FileComplaintPage, IncidentReportPage, IncidentMapPage, CaseManagementPage |
| `src/hooks/` | Custom React hooks |
| `src/services/` | API service layer |

## Configuration

- **Tailwind CSS** - `tailwind.config.js` (custom fonts, colors, animations)
- **Theme Tokens** - `src/components/shared/Themetokens.js` (Blue, Purple, Green, Dark themes)

For full project documentation, see the [root README](../README.md).
