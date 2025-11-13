# KTLO Dashboard - AWS Deprecations Tracker

A modern, interactive dashboard for managing and visualizing KTLO (Keep The Lights On) tasks, specifically focused on AWS deprecations and infrastructure updates.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tests](https://img.shields.io/badge/Tests-Vitest-yellow)
![License](https://img.shields.io/badge/License-MIT-green)

## 📑 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Development](#development)
- [Testing](#testing)
- [Data Management](#data-management)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## ✨ Features

### 🎯 Two Interactive Dashboards

#### 1. KTLO Tasks Dashboard
- **Real-time filtering** by search, status, and fiscal year
- **Visual metrics cards** showing total tasks, triage rate, CCS actions, and completion
- **Interactive charts** for status distribution and task assignments
- **Timeline urgency tracking** (overdue, 7 days, 30 days, 90 days)
- **Drill-down capability** - click any chart or metric to see detailed task lists
- **Task detail modals** with full information and Jira integration

#### 2. Database Versions Dashboard
- **Aurora PostgreSQL version tracking** across environments
- **Compliance monitoring** with end-of-life date tracking
- **Environment filtering** (Production, Staging, Development)
- **Auto-upgrade status** visibility
- **Version distribution** charts and metrics
- **Critical EOL alerts** for databases needing urgent attention

### 🔍 Advanced Features

- **Smart Search**: Full-text search across task names, comments, and program managers
- **Multiple Filters**: Combine search, status, and fiscal year filters
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Error Handling**: Graceful handling of missing or invalid data
- **Tab Navigation**: Easy switching between KTLO and Database dashboards
- **Visual Indicators**: Color-coded urgency levels and status badges

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/srinivasgunda/ktlo-dashboard.git
cd ktlo-dashboard

# Install dependencies
npm install

# Start development server (uses sample data automatically)
npm run dev
```

The dashboard will be available at **http://localhost:5173/** (or your configured port)

**Note:** The app automatically uses sample data on first run. To use your own data, see [Data Management](#data-management) section.

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Architecture

This is a **Static SPA (Single Page Application)** built with:
- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Recharts** - Interactive data visualization
- **Lucide React** - Modern icon library
- **Vitest** - Unit and integration testing

### Development Workflow

1. **Make changes** to source files in `src/`
2. **Vite hot-reloads** automatically
3. **Write tests** in `src/test/`
4. **Run tests** to ensure quality
5. **Build** before deployment

```bash
# Typical workflow
npm run dev          # Start dev server
npm test             # Run tests in watch mode
npm run build        # Build for production
```

### Environment Setup

The app runs entirely in the browser (client-side). No backend server required.

#### Port Configuration

The development server port can be customized using the `VITE_PORT` environment variable:

1. **Default**: Port 5173 (if no `.env.local` exists)
2. **Custom**: Create `.env.local` and set `VITE_PORT=5174` (or any port)
3. **Git-ignored**: `.env.local` is never committed, so each repo can have its own port

**Example for running multiple repos simultaneously:**
```bash
# Personal repo - uses port 5174
echo "VITE_PORT=5174" > .env.local

# Company repo - uses default 5173 (or create .env.local with VITE_PORT=5173)
# No .env.local needed, will use default
```

This allows you to sync code between repos without port conflicts.

## 🧪 Testing

### Test Structure

```
src/test/
├── setup.ts                 # Test configuration
├── utils.test.ts            # Unit tests for utilities
└── KtloDashboard.test.tsx   # Integration tests for dashboard
```

### Running Tests

```bash
# Run all tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --run

# Run tests with coverage
npm run test:coverage

# Open test UI in browser
npm run test:ui
```

### Test Coverage

Tests include:
- ✅ Utility function unit tests
- ✅ Data validation tests
- ✅ Error state handling tests
- ✅ Component integration tests
- ✅ Date formatting and fiscal year calculations

### Writing Tests

Example test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## 📊 Data Management

### Automatic Sample Data

**Zero Configuration Required!** The dashboard automatically uses sample data when you first clone and run the app. This means anyone can:

1. Clone the repo
2. Run `npm install && npm run dev`
3. Immediately see the dashboard with demo data

No manual file copying needed!

### Data Sources

The dashboard uses an intelligent fallback system:

1. **`src/ktlo-data.json`** - Your real KTLO tasks (git-ignored)
   - If exists: Uses your data
   - If missing: Automatically falls back to `src/ktlo-data.sample.json`

2. **`src/aurora-data.json`** - Your real Aurora database instances (git-ignored)
   - If exists: Uses your data
   - If missing: Automatically falls back to `src/aurora-data.sample.json`

### Adding Your Own Data

#### Option 1: Extract from Excel (Recommended)

```bash
# Extract data from your Excel tracker
node extract-data.js
```

This reads from `/Users/sgunda/Downloads/KTLO Tracker.xlsx` by default and creates `src/ktlo-data.json`.

#### Option 2: Manual Edit

Create or edit `src/ktlo-data.json` directly with your task data.

#### Option 3: Keep Using Sample Data

No action needed - sample data works out of the box for demos and testing!

### Data Schema

#### KTLO Tasks

```json
{
  "KTLO Item": "Task name",
  "Received On": 45292,        // Excel date number
  "Triaged": "Yes",             // Yes/No/In Progress
  "Action Needed from CCS": "Yes",
  "Status": "Completed",        // Completed/In Progress/Not Started
  "PgM Assigned": "John Doe",
  "Due Date": 45350,            // Excel date number
  "Comments": "Details here GWCP-12345"
}
```

#### Aurora Database

```json
{
  "environment": "Production",
  "autoMinorVersionUpgrade": true,
  "dbInstanceIdentifier": "my-database",
  "engineVersion": "15.4",
  "owner": "TeamName",
  "endOfStandardSupport": "2027-11-09",
  "compliant": true
}
```

### Error Handling

If data files are missing or invalid:
- ✅ Dashboard shows helpful error message
- ✅ Instructions provided to fix the issue
- ✅ Reload button to retry after fixing
- ✅ No crash or blank screens

## 📁 Project Structure

```
ktlo-dashboard/
├── src/
│   ├── App.tsx                    # Main app with tab navigation
│   ├── KtloDashboard.tsx          # KTLO tasks dashboard
│   ├── DatabaseDashboard.tsx      # Database versions dashboard
│   ├── main.tsx                   # React entry point
│   ├── style.css                  # Global styles
│   ├── ktlo-data.json            # Your KTLO data (git-ignored)
│   ├── ktlo-data.sample.json     # Sample data
│   ├── aurora-data.json          # Database data
│   └── test/
│       ├── setup.ts              # Test configuration
│       ├── utils.test.ts         # Unit tests
│       └── KtloDashboard.test.tsx # Integration tests
├── public/                        # Static assets
├── index.html                     # HTML entry point
├── vite.config.ts                # Vite configuration
├── vitest.config.ts              # Test configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
├── extract-data.js               # Excel to JSON converter
└── README.md                     # This file
```

## 🤝 Contributing

### Setup for Contributors

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Add tests for new features
6. Run tests to ensure everything works
7. Submit a pull request

```bash
git checkout -b feature/amazing-feature
git commit -m 'feat: add amazing feature'
git push origin feature/amazing-feature
```

### Coding Standards

- Use **TypeScript** for type safety
- Follow **React best practices** (hooks, functional components)
- Write **tests** for new features
- Use **meaningful commit messages** (conventional commits)
- Ensure **no console errors** in development
- Test on **multiple browsers**

### Commit Message Format

```
<type>: <description>

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: add database filtering by owner`
- `fix: correct icon alignment in search boxes`
- `docs: update README with testing instructions`
- `test: add unit tests for date utilities`

## 🐛 Troubleshooting

### Dashboard shows "No Data Available"

**Cause**: Missing or empty data file

**Solution**:
```bash
# Option 1: Extract from Excel
node extract-data.js

# Option 2: Use sample data
cp src/ktlo-data.sample.json src/ktlo-data.json

# Then refresh browser
```

### Charts not displaying

**Cause**: Browser cache or build issue

**Solution**:
```bash
# Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)
# Or rebuild
npm run build
npm run preview
```

### Tests failing

**Cause**: Missing dependencies or outdated packages

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm test
```

### Dev server won't start

**Cause**: Port already in use

**Solution**:
```bash
# Option 1: Change port in .env.local
echo "VITE_PORT=3000" > .env.local
npm run dev

# Option 2: Kill process on the port
lsof -ti:5173 | xargs kill -9  # or 5174, depending on your config

# Option 3: Use command line override
npm run dev -- --port 3000
```

### Excel extraction fails

**Causes & Solutions**:

1. **File not found**:
   ```bash
   # Update path in extract-data.js line 5
   const workbook = XLSX.readFile('/correct/path/to/KTLO Tracker.xlsx');
   ```

2. **File is open**:
   - Close Excel file
   - Run extraction again

3. **Wrong column names**:
   - Ensure Excel columns match expected schema
   - See Data Schema section above

### Build errors

**Cause**: TypeScript errors or missing types

**Solution**:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix errors shown in output
# Then build again
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Srinivas Gunda**
- GitHub: [@srinivasgunda](https://github.com/srinivasgunda)
- Email: nivasg@gmail.com

## 📈 Roadmap

Future enhancements:
- [ ] Deployment to GWCP Platform
- [ ] Realtime data refresh by querying Atmos CLI using TeamCity or GitHub Actions Runners
- [ ] Export filtered data to CSV/Excel
- [ ] Historical trend analysis
- [ ] Email notifications for deadlines
- [ ] Multi-user authentication

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

**Need help?** Open an issue on GitHub or contact the author.
