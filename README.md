# 🚀 AQLYRION

**Turn Azure DevOps data into beautiful, shareable, AI-powered reports — without ever leaving your dashboard.**

Stop copying-pasting ADO data into spreadsheets. This full-stack reporting tool pulls your Features, User Stories, Test Cases, and QA Assignments directly from Azure DevOps, visualizes them with interactive charts, writes AI-powered summaries, and lets you share read-only snapshot links with stakeholders who don't even have ADO access.

---

## ✨ What's New in This Release

| Feature | What it does | Why it matters |
|---------|-------------|----------------|
| **🤖 AI Summary** | AI-powered report summaries per tab using NVIDIA NIM | Get instant insights without reading every row |
| **🔗 Shareable Dashboard Links** | One-click public share links with auto-clipboard copy | Show execs & clients live data without ADO logins |
| **📊 Expandable Bug Trees** | Click to expand/collapse child bugs under each User Story | Drill down without the clutter |
| **💾 Persistent AI Summaries** | Saved to localStorage — survives refreshes & filter changes | Your insights stick around |

---

## 🎯 Core Features

### 🔍 Feature & Child Stories
Enter comma-separated Feature IDs and get a full breakdown with clickable links, sortable tables, and child User Story expansion.

- **Date Highlighting**: Deploy Date & Target Date turn 🔴 red when past due
- **Smart Sorting**: Proper chronological sorting for all date columns
- **Parent Feature Links**: Click through to the ADO work item
- **Tags Column**: Filter and search by tags (spillover tags hidden from display)

### 🧪 Test Case Review
Comprehensive test case filtering across all sprints or a specific iteration.

- Filter by **Status, Assignee, Automation Status, Priority, Complexity**
- Parent User Story links (comma-separated for multiple parents)
- Tags column and Created By column
- Complexity mapped to readable labels: 1-Simple, 2-Medium, 3-Complex, Not Defined

### 👥 QA Assignments
Find User Stories assigned to QA team members or sitting in "In Progress(QA)" board column.

- **Expandable Bug trees**: Click the chevron to reveal child bugs (ID, Title, Status, Assignee, Board Column, Tags)
- **Insights**: Total QA User Stories, Unique Parent Features, Open Child Bugs count
- **Visual charts**: Bug Status Distribution, Stories by Board Column, Stories by Assignee

### 🤖 AI Summary (NVIDIA NIM)
Generate AI-powered report summaries for **every tab** with a single click.

- **On-demand**: Click "Generate AI Summary" above any chart or table
- **Persistent**: Saved to localStorage — survives page refreshes and filter changes
- **Markdown-rendered**: Bold text, lists, and formatting all render beautifully
- **Collapsible**: Dismiss when you don't need it, regenerate anytime

### 🔗 Shareable Dashboard Links
Create read-only snapshot links from any tab and share them instantly.

- **One click**: "Share" button copies the URL to your clipboard with "Copied!" feedback
- **No ADO login required**: Stakeholders, execs, and clients can view without an ADO account
- **Read-only snapshots**: No live ADO data is fetched, and your PAT is never exposed
- **AI Summary included**: Previously generated AI summaries appear at the top of shared reports
- **Auto-expire**: Snapshots are retained for 7 days (configurable via `SHARE_RETENTION_DAYS`)

### 🔒 Secure by Design
- PAT stored **server-side only** — never sent to the frontend
- Rate limiting (100 req/15min), Helmet.js security headers, CORS restrictions
- All endpoints validated with Zod input validation

---

## 🛠️ Quick Start

### Prerequisites

- **Node.js 18+**
- **Azure DevOps PAT** with **Work Items (Read)** scope
- **NVIDIA NIM API Key** (for AI Summary feature — optional but recommended)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd ado_project

# Install all dependencies (root, client, server)
npm install

# Copy environment template and configure
cp .env.example .env
# Edit .env with your credentials
```

### Configuration

Edit `.env` with your Azure DevOps and AI settings:

```env
# Azure DevOps Configuration
ADO_ORG_URL=https://dev.azure.com/your-organization
ADO_PROJECT=YourProjectName
ADO_PAT=your-personal-access-token

# QA Team Emails (comma-separated) — used for QA Assignments tab
QA_TEAM_EMAILS=qa1@example.com,qa2@example.com

# Custom field reference names
ADO_FIELD_BOARD_COLUMN=System.BoardColumn
ADO_FIELD_DEPLOY_DATE=Custom.DeployDate
ADO_FIELD_TARGET_DATE=Microsoft.VSTS.Scheduling.TargetDate

# Base Iteration Path for "All Sprints" in Test Case Review
ADO_ITERATION_BASE_PATH=YourProjectName\IterationName\Sub-IterationName

# AI Summary (NVIDIA NIM)
NVIDIA_NIM_API_KEY=your-nvidia-nim-api-key
NVIDIA_NIM_BASE_URL=https://integrate.api.nvidia.com/v1
AI_SUMMARY_MODEL=meta/llama-3.1-405b-instruct
AI_SUMMARY_ENABLED=true

# Shareable Dashboard Links
SHARE_BASE_URL=http://localhost:5173/shared
SHARE_RETENTION_DAYS=7
```

### Finding Custom Field Reference Names

1. Go to **Organization Settings** → **Process**
2. Click your process (e.g., "Inherited Agile")
3. Search for the field name (e.g., "Deploy Date")
4. Copy the **Reference Name** (e.g., `Custom.DeployDate`)

Common fields:
- **Board Column**: `System.BoardColumn`
- **Deploy Date**: Often `Custom.DeployDate`
- **Target Date**: Usually `Microsoft.VSTS.Scheduling.TargetDate`
- **Complexity**: `Custom.Complexity` (dropdown: 1-Simple, 2-Medium, 3-Complex, Not Defined)

### Running the Application

```bash
# Development mode (client on :5173, server on :3001)
npm run dev

# Production build
npm run build

# Start production server
npm start
```

Open **http://localhost:5173** in your browser.

---

## 📖 Usage Guide

### Feature & Child Stories Tab
1. **Enter Feature IDs**: Type comma-separated IDs (e.g., `12345, 12346, 12347`)
2. **Fetch Data**: Click "Fetch Data" to retrieve Feature details
3. **Select Features**: Check boxes to select Features for child story fetching
4. **Fetch Child Stories**: Click "Fetch Child User Stories"
5. **Get Report**: View visual status dashboards with charts

### Test Case Review Tab
1. **Load Iterations**: Fetch available iterations
2. **Select Iteration**: Choose one, or "All Sprints" to fetch across all sprints
3. **Get Test Cases**: Retrieve Test Cases linked to User Stories in that iteration
4. **Filter & Sort**: Use dropdowns (Status, Assignee, Automation Status, Priority, Complexity) and click column headers to sort
5. **View Parent US**: Click Parent User Story links to open in ADO

### QA Assignments Tab
1. **Load Iterations**: Fetch available iterations
2. **Select Iteration**: Choose from the dropdown
3. **Get QA US**: Retrieve User Stories assigned to QA team members or in "In Progress(QA)" column
4. **Filter & Sort**: Use Status, Assignee, Board Column, Parent Feature, and Search Title filters
5. **Expand Bugs**: Click the chevron icon to expand/collapse child Bug details
6. **View Insights**: See totals for QA User Stories, Parent Features, and open Bugs

### 🤖 AI Summary
1. **Generate**: Click "Generate AI Summary" above any chart or table
2. **View**: AI-generated summary appears in a collapsible card
3. **Persist**: Summary auto-saves to localStorage — survives refreshes and filter changes
4. **Regenerate**: Click again to refresh with current data
5. **Dismiss**: Hide anytime; regenerate to bring it back

### 🔗 Shareable Dashboard Links
1. **Create**: Click "Share" on any tab (Features, Child Stories, Test Cases, QA Assignments)
2. **Copy**: Share URL auto-copies to clipboard with "Copied!" feedback
3. **View**: Open the link in any browser — **no ADO login required** (perfect for execs & clients)
4. **Read-Only**: Frozen snapshot — no live ADO fetch, no PAT exposure
5. **AI Summary**: Appears at the top of shared reports if previously generated
6. **Expires**: Links expire after 7 days (configurable)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/features` | Fetch Features by IDs |
| POST | `/api/child-stories` | Fetch child User Stories for Features |
| GET | `/api/field-mappings` | Get current custom field mappings |
| POST | `/api/test-cases` | Fetch Test Cases for iteration |
| POST | `/api/qa-assignments/qa-user-stories` | Fetch QA User Stories with child Bugs |
| POST | `/api/ai-summary` | Generate AI summary for tab data |
| POST | `/api/shares` | Create a shareable dashboard snapshot |
| GET | `/api/shares/:shareId` | Retrieve a shared snapshot (read-only) |

### Request Examples

```bash
# Fetch Features
curl -X POST http://localhost:3001/api/features \
  -H "Content-Type: application/json" \
  -d '{"ids": [12345, 12346]}'

# Generate AI Summary
curl -X POST http://localhost:3001/api/ai-summary \
  -H "Content-Type: application/json" \
  -d '{"tab": "bugs", "data": {"bugs": [{"id": 1, "title": "Bug 1", "status": "Open"}]}, "context": "Bug Report"}'

# Create Shareable Snapshot
curl -X POST http://localhost:3001/api/shares \
  -H "Content-Type: application/json" \
  -d '{"tab": "bugs", "data": {"bugs": [{"id": 1, "title": "Bug 1", "status": "Open"}]}, "title": "Bug Report"}'

# Retrieve Shared Snapshot
curl http://localhost:3001/api/shares/<shareId>
```

---

## 📡 Azure DevOps API Used

| Purpose | Endpoint | Version |
|---------|----------|---------|
| Get work items by IDs | `GET /{org}/{project}/_apis/wit/workitems` | 7.1 |
| Get work item relations | `GET /{org}/{project}/_apis/wit/workitems/{id}?$expand=relations` | 7.1 |
| WIQL query (hierarchy) | `POST /{org}/{project}/_apis/wit/wiql` | 7.1 |
| WIQL query (tested by) | `POST /{org}/{project}/_apis/wit/wiql` | 7.1 |
| WIQL query (QA assignments) | `POST /{org}/{project}/_apis/wit/wiql` | 7.1 |
| Get teams | `GET /{org}/{project}/_apis/projects/{project}/teams` | 7.1 |
| Get boards | `GET /{org}/{project}/{team}/_apis/work/boards` | 7.1 |
| Get board columns | `GET /{org}/{project}/{team}/_apis/work/boards/{board}/columns` | 7.1 |

---

## 📁 Project Structure

```
ado_project/
├── .env.example          # Configuration template
├── .gitignore
├── package.json          # Root workspace
├── README.md
├── client/               # React + Vite + TypeScript
│   ├── src/
│   │   ├── api/          # API client (ado.ts, share.ts)
│   │   ├── components/   # AISummaryCard, ShareButton, SharedReportView, FeatureTable, ChildStoryTable, TestCaseTable, QAAssignmentsTable, etc.
│   │   ├── hooks/        # useFeatures, useChildStories, useTestCases, useQaUserStories, useAISummary, useShare, etc.
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Formatters, date helpers
│   │   └── tests/        # Unit & component tests
└── server/               # Express + TypeScript
    ├── src/
    │   ├── config/       # Environment config (NVIDIA NIM, Share settings)
    │   ├── routes/       # features, child-stories, test-cases, qa-assignments, ai-summary, shares
    │   ├── services/     # featureService, childStoryService, testCaseService, qaService, aiSummaryService, shareService
    │   ├── middleware/   # Express middleware
    │   ├── types/        # TypeScript types
    │   └── utils/        # adoUrls, fieldMapping
    ├── data/
    │   └── shares/       # JSON snapshot files for shareable links (gitignored)
    └── tests/            # Unit & integration tests
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run server tests only
npm run test:server

# Run client tests only
npm run test:client

# Watch mode
npm run test:watch
```

---

## 🛡️ Security

- **PAT stored server-side only** — never logged, never sent to frontend
- **CORS restricted** to configured origin
- **Rate limiting** enabled (100 req/15min)
- **Helmet.js** for security headers
- **Input validation** on all endpoints via Zod
- **Share links are read-only** — no live ADO fetch, no PAT exposure, no authentication required (by design for stakeholder access)

---

## 🩺 Troubleshooting

| Issue | Fix |
|-------|-----|
| **401 Unauthorized** | Check PAT is valid and has **Work Items (Read)** scope; ensure it hasn't expired |
| **403 Forbidden** | PAT may not have project access; check project permissions |
| **No child User Stories** | Features may not have child User Stories; check hierarchy link type in ADO |
| **QA Assignments empty** | Verify `QA_TEAM_EMAILS` matches exact ADO emails; check "In Progress(QA)" board column name |
| **Custom fields showing "—"** | Verify field reference names in `.env`; check Organization Settings → Process |
| **Test Case Complexity missing** | Verify `Custom.Complexity` exists with dropdown values: 1-Simple, 2-Medium, 3-Complex, Not Defined |

---

## 📄 License

MIT

---

## ☕ Made with Coffee Love

Crafted with ☕ and ❤️ by **Rishi Mankkar**.

Building tools that make ADO reporting effortless — one sip of coffee at a time.

---

<p align="center">
  <b>Happy Reporting! 🚀</b>
</p>