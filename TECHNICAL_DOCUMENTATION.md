# KTLO Dashboard - Technical Documentation

## 🎯 Executive Summary

This document explains exactly what was built, how it works, and how to use and maintain the KTLO Dashboard.

---

## 📋 Table of Contents

1. [What Was Built](#what-was-built)
2. [Technology Stack](#technology-stack)
3. [Features Implemented](#features-implemented)
4. [How It Works](#how-it-works)
5. [Testing Checklist](#testing-checklist)
6. [Deployment Guide](#deployment-guide)
7. [Maintenance & Updates](#maintenance--updates)

---

## 🏗️ What Was Built

### Dashboard Overview

A comprehensive, interactive web dashboard that visualizes KTLO (Keep The Lights On) tasks for AWS deprecations and infrastructure updates. The dashboard transforms your Excel tracker into a live, interactive visual experience.

### Key Capabilities

✅ **Real-time Data Visualization** - Converts Excel data to interactive charts
✅ **Multi-level Filtering** - Filter by fiscal year, status, and search terms
✅ **Click-through Analysis** - Every chart and metric is clickable for details
✅ **Jira Integration** - Automatically extracts and links Jira tickets
✅ **Deadline Tracking** - Monitors tasks due in 7, 30, and 90 days
✅ **Responsive Design** - Works on desktop, tablet, and mobile

---

## 💻 Technology Stack

### Frontend Framework
**React 18.x with TypeScript**
- Component-based architecture
- Type-safe development
- Modern hooks (useState, useMemo)
- No class components - all functional

### Build Tool
**Vite 7.x**
- Lightning-fast hot module replacement (HMR)
- Optimized production builds
- Modern ES modules
- Faster than Webpack/Create React App

### Chart Library
**Recharts 3.x**
- Built specifically for React
- Responsive charts
- Interactive tooltips
- Click events on all elements
- Supports: Pie charts, Bar charts, Line charts

### Icon Library
**Lucide React**
- Modern, clean icons
- Tree-shakeable (only imports used icons)
- Consistent styling
- Examples used: CheckCircle, AlertCircle, TrendingUp, Calendar, Filter, Search, ExternalLink

### Data Processing
**XLSX Library**
- Reads Excel files (.xlsx, .xls)
- Converts to JSON
- Handles Excel date formats
- Works in Node.js

### Styling
**Custom CSS + Utility Classes**
- Tailwind-inspired utility classes (without full Tailwind)
- Gradient backgrounds
- Smooth transitions
- Hover effects
- Responsive grid system

---

## 🎨 Features Implemented

### 1. Fiscal Year Filter ✅

**Location:** Top filter bar, middle dropdown

**How it works:**
- Automatically detects all fiscal years from your data
- Fiscal year calculation: August - July (FY26 = Aug 2025 - Jul 2026)
- Filters all metrics, charts, and tables when selected
- Combines with other filters

**Code:**
```typescript
const getFiscalYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  if (month >= 7) { // August onwards
    return `FY${(year + 1).toString().slice(-2)}`;
  }
  return `FY${year.toString().slice(-2)}`;
};
```

### 2. Working Search Bar ✅

**Location:** Top filter bar, left input

**Searches across:**
- KTLO Item name
- Comments field
- PgM Assigned name

**Features:**
- Real-time filtering (updates as you type)
- Case-insensitive
- Trims whitespace
- Shows active filter badge
- Clear all button to reset

**Code:**
```typescript
if (searchTerm.trim()) {
  const search = searchTerm.toLowerCase().trim();
  filtered = filtered.filter(item =>
    item['KTLO Item']?.toLowerCase().includes(search) ||
    item.Comments?.toLowerCase().includes(search) ||
    item['PgM Assigned']?.toLowerCase().includes(search)
  );
}
```

### 3. Interactive Charts with Drill-Down ✅

**All charts are clickable:**

**Status Distribution Pie Chart:**
- Click any slice → Opens modal with all tasks of that status
- Example: Click "In Progress" → See all in-progress tasks

**Program Manager Bar Chart:**
- Click any bar → See all tasks assigned to that PgM
- Example: Click "Srinivas Gunda" → See all his tasks

**Top AWS Services Bar Chart:**
- Click any bar → See all tasks for that service
- Example: Click "EKS / Kubernetes" → See all EKS-related tasks

**Implementation:**
```typescript
onClick={(data) => {
  const items = processedData.filtered.filter(/* filter logic */);
  handleDrillDown('type', items, 'Title');
}}
```

### 4. Improved AWS Services Visualization ✅

**Before:** Generic horizontal bars (hard to understand)

**After:**
- Descriptive title: "Top AWS Services with Deprecations"
- Subtitle explaining: "Most frequently deprecated AWS services"
- Intelligent service categorization:
  - Groups related services (RDS + PostgreSQL + Aurora = "RDS / Aurora")
  - Recognizes 15+ AWS services automatically
  - Shows top 10 by frequency
- Legend shows "Number of Deprecations"
- Click instruction: "Click any bar to see related tasks"
- Horizontal layout with service names on Y-axis (easier to read)

**Service Detection:**
```typescript
if (itemText.includes('EKS') || itemText.includes('Kubernetes')) {
  service = 'EKS / Kubernetes';
} else if (itemText.includes('Lambda')) {
  service = 'Lambda';
} // ... 13 more services
```

### 5. Deadline Cards (7/30/90 days) ✅

**Location:** Second row of metric cards (row with 4 cards)

**Four clickable cards:**

1. **Overdue (Red)**
   - Shows tasks past due date (excluding completed)
   - Subtitle: "Past due date"
   - Click → Modal with overdue tasks

2. **Due in 7 Days (Orange)**
   - Urgent tasks due within next week
   - Subtitle: "Urgent attention"
   - Click → Modal with upcoming tasks

3. **Due in 30 Days (Yellow)**
   - Tasks due this month
   - Subtitle: "This month"
   - Click → Modal with monthly tasks

4. **Due in 90 Days (Green)**
   - Tasks due this quarter
   - Subtitle: "This quarter"
   - Click → Modal with quarterly tasks

**Each card:**
- Has hover effect (scales up)
- Shows count
- Has appropriate color
- Displays "Click to view details" hint
- Opens detailed drill-down modal

**Calculation:**
```typescript
const getDaysFromNow = (days: number) =>
  new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

const dueNext7Days = filtered.filter(item => {
  if (typeof item['Due Date'] === 'number' && item.Status !== 'Completed') {
    const dueDate = excelDateToJSDate(item['Due Date']);
    return dueDate >= now && dueDate <= getDaysFromNow(7);
  }
  return false;
});
```

### 6. Jira ID Extraction & Display ✅

**Automatically detects Jira tickets in Comments:**

**Supported formats:**
- GWCP-12345
- RE-7890
- BITS-5180
- Case insensitive

**Displayed in:**

1. **Task List Table** (new "Tracking" column):
   - Shows Jira ID as clickable badge
   - Blue background
   - External link icon
   - Opens in new tab
   - Example: `GWCP-63357 ↗`

2. **Drill-Down Modal** (when clicking charts/cards):
   - Same "Tracking" column
   - Clickable Jira links

3. **Detail Modal** (when clicking task row):
   - Dedicated "Tracking Jira" section
   - Large blue button: "Open GWCP-12345 in Jira"
   - External link icon

**Extraction Logic:**
```typescript
const extractJiraId = (comments?: string): string | null => {
  if (!comments) return null;
  const jiraMatch = comments.match(/(?:GWCP|RE|BITS)-\d+/i);
  return jiraMatch ? jiraMatch[0] : null;
};
```

**Link Generation:**
```typescript
href={`https://guidewirejira.atlassian.net/browse/${jiraId}`}
target="_blank"
rel="noopener noreferrer"
```

### 7. Improved UI/UX Design ✅

**Visual Improvements:**

1. **Gradient Background**
   - Subtle gray gradient (from-gray-50 to-gray-100)
   - Modern, professional look
   - Reduces eye strain

2. **Card Enhancements**
   - Rounded corners (rounded-lg)
   - Shadow effects (shadow-md)
   - Hover animations on clickable cards
   - Scale effect (hover:scale-105)
   - Better spacing and padding

3. **Color Coding System**
   - Red (#ef4444): Overdue, urgent
   - Orange (#f59e0b): Due soon, needs action
   - Yellow (#eab308): Pending, not started
   - Green (#10b981): Completed, on track
   - Blue (#3b82f6): In progress, informational
   - Purple (#8b5cf6): PgM assignments

4. **Active Filter Badges**
   - Shows what filters are active
   - Color-coded pills
   - "Clear all" button
   - Example: "Active filters: Search: 'EKS' | FY26 | Completed"

5. **Clickability Indicators**
   - Cursor changes to pointer
   - Hover tooltips: "Click for details"
   - Visual feedback (shadow increase)
   - Subtle instructions under charts

6. **Modals**
   - Semi-transparent backdrop (bg-black bg-opacity-50)
   - Centered, scrollable
   - Click outside to close
   - Large X button to close
   - Smooth transitions

7. **Table Improvements**
   - Sticky header (stays visible when scrolling)
   - Alternating row hover effects
   - Overdue tasks highlighted in red background
   - Status badges with color coding
   - Jira badges styled consistently

8. **Responsive Design**
   - Grid system: 1 column (mobile) → 2 columns (tablet) → 4 columns (desktop)
   - Charts resize automatically
   - Tables scroll horizontally on small screens
   - Touch-friendly click areas

**Typography:**
- Headers: Bold, large (text-4xl, text-2xl, text-xl)
- Body: Medium size (text-sm, text-base)
- Labels: Gray, uppercase, semibold
- Consistent font family (system fonts)

### 8. Additional Enhancements ✅

**Alert System:**
- Red warning banner when overdue tasks exist
- Shows count and instruction
- Only appears when relevant

**Empty States:**
- Gracefully handles no data
- Percentage calculations avoid division by zero

**Performance Optimizations:**
- useMemo for expensive calculations
- Only re-renders when filters change
- Lazy loading of modals (only render when open)

---

## 🔧 How It Works

### Data Flow

```
KTLO Tracker.xlsx
      ↓
extract-data.js (XLSX library)
      ↓
src/ktlo-data.json
      ↓
KtloDashboard.tsx (React component)
      ↓
Recharts (visualizations)
      ↓
Browser (rendered HTML/CSS)
```

### Step-by-Step Process

**Step 1: Excel to JSON Conversion**
```bash
node extract-data.js
```
- Reads `/Users/sgunda/Downloads/KTLO Tracker.xlsx`
- Parses all rows and columns
- Converts Excel dates to numbers (Excel serial format)
- Outputs to `src/ktlo-data.json`

**Step 2: React Application Loads**
```typescript
import ktloData from './ktlo-data.json';
```
- Imports JSON data as JavaScript object
- TypeScript provides type safety
- Data loaded once on app start

**Step 3: Data Processing (useMemo)**
```typescript
const processedData = useMemo(() => {
  // Apply all filters
  // Calculate all metrics
  // Generate chart data
  return { total, triaged, charts, ... };
}, [searchTerm, statusFilter, fiscalYearFilter]);
```
- Only recalculates when filters change
- Optimizes performance
- Prevents unnecessary re-renders

**Step 4: Rendering**
- React renders components based on processedData
- Recharts generates SVG visualizations
- CSS applies styling
- Event handlers attached for interactions

**Step 5: User Interactions**
- Click events trigger state updates
- State changes trigger re-renders
- Modals open/close via state management
- Filters update processedData via useMemo

### State Management

**React useState hooks:**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState<string>('All');
const [fiscalYearFilter, setFiscalYearFilter] = useState<string>('All');
const [selectedItem, setSelectedItem] = useState<KTLOItem | null>(null);
const [drillDownData, setDrillDownData] = useState<{ ... } | null>(null);
```

**Flow:**
1. User types in search box
2. `setSearchTerm(newValue)` called
3. State updates
4. `useMemo` dependency triggers recalculation
5. Component re-renders with filtered data

### Fiscal Year Calculation

**Algorithm:**
```typescript
// FY26 = Aug 1, 2025 - Jul 31, 2026
// If current month >= August (month 7):
//   FY = (current year + 1)
// Else:
//   FY = current year

Example:
- Oct 2024 → Month 9 → >= 7 → FY25
- Jan 2025 → Month 0 → < 7 → FY25
- Aug 2025 → Month 7 → >= 7 → FY26
```

### Date Handling

**Excel Date Serial:**
- Excel stores dates as numbers
- Number represents days since Jan 1, 1900
- Example: 45538 = Aug 1, 2024

**Conversion:**
```typescript
const excelDateToJSDate = (excelDate: number): Date => {
  // Excel epoch starts at 1900-01-01
  // JavaScript epoch starts at 1970-01-01
  // Difference: 25569 days
  return new Date((excelDate - 25569) * 86400 * 1000);
};
```

### Drill-Down Mechanism

**When user clicks chart/card:**
```typescript
const handleDrillDown = (type: string, items: KTLOItem[], title: string) => {
  setDrillDownData({ type, items, title });
};
```

**State update triggers:**
- Conditional rendering: `{drillDownData && <Modal />}`
- Modal appears with filtered items
- Table inside modal shows just those items
- Clicking item inside modal closes drill-down and opens detail modal

---

## ✅ Testing Checklist

### Manual Testing Guide

**Before marking as "ready to launch", verify each item:**

#### Filters

- [ ] **Fiscal Year Filter**
  - [ ] Dropdown shows all years (FY24, FY25, etc.)
  - [ ] Selecting a year filters all data
  - [ ] Metrics update correctly
  - [ ] Charts update correctly
  - [ ] "All Years" shows everything

- [ ] **Search Bar**
  - [ ] Type "EKS" → Shows only EKS-related tasks
  - [ ] Type "Srinivas" → Shows only his tasks
  - [ ] Type partial word → Works correctly
  - [ ] Clear search → Shows all data
  - [ ] Search is case-insensitive

- [ ] **Status Filter**
  - [ ] "Completed" → Shows only completed
  - [ ] "In Progress" → Shows only in-progress
  - [ ] "Not Started" → Shows only not-started
  - [ ] "All Status" → Shows everything

- [ ] **Combined Filters**
  - [ ] FY26 + "EKS" search → Combines correctly
  - [ ] All three filters → Works together
  - [ ] Active filter badges appear
  - [ ] "Clear all" button resets everything

#### Metric Cards

- [ ] **Total Tasks** - Shows correct count
- [ ] **Triaged** - Shows count and percentage
- [ ] **Needs CCS Action** - Clickable, opens modal
- [ ] **Completed** - Shows count and completion %

- [ ] **Overdue Card** - Red, clickable
  - [ ] Click → Opens modal with overdue tasks
  - [ ] Modal shows correct tasks
  - [ ] Jira links work

- [ ] **Due in 7 Days** - Orange, clickable
  - [ ] Shows correct count
  - [ ] Click → Opens modal
  - [ ] Modal accurate

- [ ] **Due in 30 Days** - Yellow, clickable
  - [ ] Count correct
  - [ ] Modal works

- [ ] **Due in 90 Days** - Green, clickable
  - [ ] Count correct
  - [ ] Modal works

#### Charts

- [ ] **Status Pie Chart**
  - [ ] Displays correctly
  - [ ] Percentages add to 100%
  - [ ] Hover shows tooltip
  - [ ] Click slice → Opens modal
  - [ ] Modal shows correct status items

- [ ] **PgM Bar Chart**
  - [ ] Shows all PgMs
  - [ ] Bars sized correctly
  - [ ] Hover shows count
  - [ ] Click bar → Opens PgM's tasks
  - [ ] Modal accurate

- [ ] **AWS Services Bar Chart**
  - [ ] Horizontal layout
  - [ ] Shows top 10 services
  - [ ] Labels readable
  - [ ] Legend shows "Number of Deprecations"
  - [ ] Click bar → Opens service tasks
  - [ ] Services grouped logically (EKS/Kubernetes, RDS/Aurora, etc.)

#### Task List Table

- [ ] Shows all filtered tasks
- [ ] Columns: KTLO Item, Status, PgM, Due Date, Tracking
- [ ] Overdue tasks have red background
- [ ] Status badges color-coded
- [ ] Due dates formatted correctly
- [ ] Overdue dates show ⚠️ emoji
- [ ] Jira IDs extracted and shown
- [ ] Jira links clickable
- [ ] Jira links open in new tab
- [ ] Jira links go to correct URL
- [ ] Row hover effect works
- [ ] Click row → Opens detail modal

#### Drill-Down Modal

- [ ] Opens when clicking chart/card
- [ ] Shows correct title
- [ ] Shows correct count
- [ ] Table displays filtered items
- [ ] Can scroll if many items
- [ ] Click X button → Closes
- [ ] Click outside → Closes
- [ ] Click item in table → Opens detail modal

#### Detail Modal

- [ ] Shows complete task information
- [ ] All fields populated correctly
- [ ] Dates formatted properly
- [ ] Jira button appears if Jira ID exists
- [ ] Jira button goes to correct URL
- [ ] Comments section scrollable
- [ ] Comments preserve formatting
- [ ] X button closes modal
- [ ] Click outside closes modal

#### UI/UX

- [ ] Gradient background displays
- [ ] Cards have shadows
- [ ] Hover effects work on clickable items
- [ ] Cursor changes to pointer on clickables
- [ ] Transitions smooth
- [ ] "Click to view details" hints visible
- [ ] Active filter badges display
- [ ] Colors consistent throughout
- [ ] Text readable (contrast sufficient)
- [ ] No layout shifts/jumps

#### Responsive Design

- [ ] Test on desktop (1920x1080)
- [ ] Test on laptop (1366x768)
- [ ] Test on tablet (iPad - 768px)
- [ ] Test on mobile (iPhone - 375px)
- [ ] Charts resize appropriately
- [ ] Table scrolls horizontally if needed
- [ ] Cards stack on small screens
- [ ] Modals don't overflow

#### Data Accuracy

- [ ] Total count matches Excel row count
- [ ] Completed count matches Excel
- [ ] Overdue calculation correct (compare Excel dates)
- [ ] Fiscal year assignment correct
- [ ] All Jira IDs extracted (manually check 5-10)
- [ ] No missing data in table
- [ ] Percentages calculate correctly

#### Performance

- [ ] Dashboard loads in < 3 seconds
- [ ] Typing in search is responsive (no lag)
- [ ] Changing filters is instant
- [ ] Charts render smoothly
- [ ] No console errors
- [ ] No console warnings

#### Error Handling

- [ ] Empty search → Shows message or all data
- [ ] No matching filters → Graceful handling
- [ ] Missing data fields → Shows "-"
- [ ] Invalid dates → Doesn't crash
- [ ] Missing Jira ID → Shows "-" not error

---

## 🚀 Deployment Guide

### Local Development (Current)

**Already running:**
```bash
npm run dev
# Open http://localhost:5173/
```

### Production Build

**Create optimized build:**
```bash
npm run build
```
- Output in `dist/` folder
- Minified JavaScript
- Optimized CSS
- Ready for deployment

**Preview production build:**
```bash
npm run preview
# Test the built version locally
```

### Deploy to Netlify (Easiest)

**One-time setup:**
```bash
npm install -g netlify-cli
netlify login
```

**Deploy:**
```bash
npm run build
netlify deploy --prod --dir=dist
```

**Netlify will give you a URL like:**
`https://ktlo-dashboard-abc123.netlify.app`

### Deploy to Vercel

**Install Vercel CLI:**
```bash
npm install -g vercel
```

**Deploy:**
```bash
vercel --prod
```

**Result:**
`https://ktlo-dashboard.vercel.app`

### Deploy to Company Server

**Option 1: Static hosting (Nginx/Apache)**
```bash
# Build
npm run build

# Copy dist/ folder to web server
scp -r dist/* user@server:/var/www/ktlo-dashboard/

# Configure Nginx
location / {
  root /var/www/ktlo-dashboard;
  try_files $uri $uri/ /index.html;
}
```

**Option 2: Node.js server**
```bash
# Install serve
npm install -g serve

# Run on port 3000
serve -s dist -p 3000

# Keep running with PM2
pm2 start "serve -s dist -p 3000" --name ktlo-dashboard
pm2 save
pm2 startup
```

---

## 🔄 Maintenance & Updates

### Updating Data

**When Excel tracker changes:**

```bash
# 1. Update Excel file
# (Edit /Users/sgunda/Downloads/KTLO Tracker.xlsx)

# 2. Re-extract data
node extract-data.js

# 3. Dashboard auto-reloads (if dev server running)
# OR rebuild for production:
npm run build
```

### Automating Data Updates

**Option 1: Watch for Excel changes**
```bash
npm install -g chokidar-cli
chokidar "/Users/sgunda/Downloads/KTLO Tracker.xlsx" -c "node extract-data.js"
```

**Option 2: Scheduled updates (cron)**
```bash
# Add to crontab (runs daily at 6 AM)
0 6 * * * cd /path/to/ktlo-dashboard && node extract-data.js
```

**Option 3: Google Sheets sync** (future enhancement)
- Move Excel to Google Sheets
- Use Google Sheets API
- Auto-fetch every 5 minutes

### Adding New Features

**Common modifications:**

**Add new metric card:**
```typescript
<MetricCard
  title="Your New Metric"
  value={processedData.yourMetric}
  icon={<YourIcon size={40} />}
  color="#yourColor"
/>
```

**Add new chart:**
```typescript
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={yourData}>
    <Bar dataKey="value" fill="#color" />
  </BarChart>
</ResponsiveContainer>
```

**Modify Jira URL:**
```typescript
// Change line 635, 724, 807
href={`https://your-jira-url.com/browse/${jiraId}`}
```

**Change fiscal year start month:**
```typescript
// Change line 48 (currently August = month 7)
if (month >= 7) { // Change 7 to different month (0=Jan, 6=Jul, 8=Sep)
```

### Troubleshooting

**Dashboard shows no data:**
```bash
# Check if data file exists
ls -la src/ktlo-data.json

# Re-extract
node extract-data.js
```

**Search not working:**
- Clear browser cache
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check console for errors

**Charts not clicking:**
- Ensure using latest code
- Check onClick handlers in KtloDashboard.tsx lines 501, 533, 564

**Jira links broken:**
- Verify Jira URL in code
- Check Jira ID regex pattern (line 39)
- Test with known Jira ID

**Dates wrong:**
- Excel date conversion issue
- Check excelDateToJSDate function (line 25)
- Verify Excel dates are numbers, not text

---

## 📦 File Structure

```
ktlo-dashboard/
├── node_modules/          # Dependencies (don't commit)
├── public/                # Static assets
├── src/
│   ├── App.tsx           # Main App component
│   ├── KtloDashboard.tsx # Dashboard component (main file)
│   ├── ktlo-data.json    # Extracted data from Excel
│   ├── main.tsx          # React entry point
│   └── style.css         # Global styles
├── extract-data.js       # Excel to JSON converter
├── index.html            # HTML template
├── package.json          # Dependencies & scripts
├── tsconfig.json         # TypeScript config
├── README.md             # User documentation
├── USAGE_GUIDE.md        # How to use the dashboard
└── TECHNICAL_DOCUMENTATION.md  # This file
```

---

## 🎓 Learning Resources

**If you want to customize further:**

**React:**
- https://react.dev/learn
- Focus on: Components, State, Hooks

**TypeScript:**
- https://www.typescriptlang.org/docs/handbook/intro.html
- Focus on: Interfaces, Types

**Recharts:**
- https://recharts.org/en-US/
- Focus on: Composable Charts, Events

**Vite:**
- https://vitejs.dev/guide/
- Focus on: Build, Config

---

## 🤝 Support

**Need help?**
1. Check console for errors (F12 → Console tab)
2. Review this documentation
3. Check source code comments
4. Test with sample data first

**Common issues already solved:**
- ✅ Search not working → Fixed with trim() and toLowerCase()
- ✅ Fiscal year calculation → Implemented Aug-Jul logic
- ✅ Jira extraction → Regex pattern matches GWCP, RE, BITS
- ✅ Click events → Added onClick handlers to all charts
- ✅ Date formatting → Excel serial conversion working

---

**Dashboard Status: ✅ READY FOR TESTING**

All requested features have been implemented and are working. Please test thoroughly using the checklist above before going live.
