# KTLO Dashboard - AWS Deprecations Tracker

A modern, interactive dashboard for managing and visualizing KTLO (Keep The Lights On) tasks, specifically focused on AWS deprecations and infrastructure updates.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Quick Start

The dashboard is now running at: **http://localhost:5173/**

```bash
# Start the development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Dashboard Features

### Key Metrics Cards
- **Total KTLO Tasks**: Overview of all tasks for FY26 (Aug 2025 - July 2026)
- **Triaged Tasks**: Number and percentage of tasks that have been reviewed
- **Needs CCS Action**: Tasks requiring action from the CCS team
- **Completed Tasks**: Track completion rate and progress

### Interactive Visualizations

#### 1. Status Distribution (Pie Chart)
- Visual breakdown of tasks by status (Completed, In Progress, Not Started)
- Click segments to see detailed information
- Hover for exact counts and percentages

#### 2. Upcoming Deadlines (Bar Chart)
- Color-coded timeline view:
  - 🔴 **Overdue** - Tasks past their due date
  - 🟠 **This Week** - Urgent items due within 7 days
  - 🟡 **This Month** - Items due within 30 days
  - 🟢 **This Quarter** - Items due within 90 days

#### 3. Tasks by Program Manager (Bar Chart)
- Workload distribution across team members
- Identify bottlenecks and balance assignments

#### 4. Top AWS Services (Horizontal Bar Chart)
- Most frequently deprecated services
- Helps prioritize learning and preparation

### Advanced Features

#### 🔍 Search & Filter
- **Full-text search**: Search by task name or comments
- **Status filter**: Filter by Completed, In Progress, Not Started, or All
- Real-time filtering with instant results

#### 🚨 Urgent Alerts
- Automatic notification banner for:
  - Overdue tasks
  - Tasks due within the next week
- Highly visible red alert box at the top

#### 📋 Interactive Task List
- Sortable table with all task details
- Color-coded status badges
- Click any row to open detailed modal
- Overdue tasks highlighted in red background

#### 💬 Detailed Task Modal
- Click any task to see full details:
  - Complete description and comments
  - All metadata (PgM, dates, status, etc.)
  - Action requirements
  - Timeline information

## 🎨 Color Coding System

- 🔴 **Red**: Overdue or critical items
- 🟠 **Orange**: Action needed from CCS
- 🟢 **Green**: Completed tasks
- 🔵 **Blue**: In Progress tasks
- 🟡 **Yellow**: Not Started tasks

## 📁 Data Management

### Updating Your Data

Your KTLO data is currently stored in `src/ktlo-data.json`, which was automatically extracted from your Excel file.

#### Option 1: Manual Update (Recommended for now)
When you update your Excel tracker:

```bash
# Re-extract data from Excel
node extract-data.js
```

This will automatically update `src/ktlo-data.json` with the latest data from:
`/Users/sgunda/Downloads/KTLO Tracker.xlsx`

#### Option 2: Update Excel Path
If you move your Excel file, edit `extract-data.js` and update line 5:

```javascript
const workbook = XLSX.readFile('/path/to/your/KTLO Tracker.xlsx');
```

### Data Structure

Your Excel file is expected to have these columns:
- `KTLO Item` - Task name/description
- `Received On` - Date task was received (Excel date format)
- `Triaged` - Yes/No/In Progress
- `Action Needed from CCS` - Yes/No
- `Status` - Completed/In Progress/Not Started
- `PgM Assigned` - Program Manager name
- `Due Date` - Task deadline (Excel date format)
- `Comments` - Additional notes and details

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Charts**: Recharts (responsive, interactive charts)
- **Icons**: Lucide React
- **Excel Parsing**: xlsx library
- **Styling**: Custom CSS with Tailwind-inspired utilities

## 📈 Insights & Analytics

The dashboard automatically calculates and displays:

1. **Completion Rate**: Percentage of tasks marked as completed
2. **Triage Rate**: Percentage of tasks that have been reviewed
3. **Workload Distribution**: Tasks per Program Manager
4. **Service Impact**: Which AWS services are most affected
5. **Timeline Urgency**: Categorized upcoming deadlines
6. **Risk Indicators**: Overdue tasks and urgent items

## 🔧 Customization

### Adding New Visualizations

Edit `src/KtloDashboard.tsx` to add custom charts or metrics. The dashboard uses Recharts, which supports:
- Bar Charts, Pie Charts, Line Charts
- Area Charts, Scatter Plots, Radar Charts
- And many more...

### Adjusting Time Periods

Current fiscal year is defined in the header. To change:
- Edit the text in the dashboard header (line ~217)
- Dates are automatically calculated from current date

### Color Scheme

Update colors in the `processedData` section:
- Status colors (lines ~150-154)
- Timeline colors (lines ~157-162)

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers (optimal experience)
- Tablets (iPad, etc.)
- Mobile phones (stacked layout)

## 🚀 Future Enhancements

Possible improvements:
1. **File Upload**: Drag-and-drop Excel files directly in the browser
2. **Data Export**: Download filtered/searched results
3. **Historical Trends**: Track completion rates over time
4. **Email Alerts**: Automatic notifications for upcoming deadlines
5. **Multi-user Support**: Different views for different teams
6. **API Integration**: Direct connection to project management tools
7. **Dark Mode**: Toggle between light and dark themes

## 🐛 Troubleshooting

**Dashboard shows no data:**
- Check that `src/ktlo-data.json` exists
- Verify the JSON file is not empty
- Run `node extract-data.js` to regenerate

**Charts not displaying:**
- Clear browser cache
- Check browser console for errors
- Ensure all dependencies are installed: `npm install`

**Excel extraction fails:**
- Verify Excel file path in `extract-data.js`
- Ensure Excel file is not open in another program
- Check that column headers match expected names

## 📄 License

This dashboard was created for internal use by the CCS team.

## 👨‍💻 Support

For questions or issues:
1. Check the browser console for errors
2. Review the data in `src/ktlo-data.json`
3. Verify Excel file format matches expected structure

---


## 📁 Data Setup

### First Time Setup

The dashboard uses sample data by default. To use your own data:

1. **Copy the sample file:**
   ```bash
   cp src/ktlo-data.sample.json src/ktlo-data.json
   ```

2. **Extract from your Excel file:**
   ```bash
   # Update the Excel path in extract-data.js first
   node extract-data.js
   ```

3. **Or manually edit** `src/ktlo-data.json` with your task data

**Note**: `src/ktlo-data.json` is git-ignored to keep your actual task data private.

## 👥 Author

**Srinivas Gunda**
- GitHub: [@srinivasgunda](https://github.com/srinivasgunda)
- Email: nivasg@gmail.com

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!
