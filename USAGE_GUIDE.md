# KTLO Dashboard - Usage Guide

## 🎯 What You'll See

### Dashboard Layout

When you open http://localhost:5173/, you'll see:

#### **Top Section: Header**
- Dashboard title: "KTLO Dashboard - AWS Deprecations"
- Subtitle: "Financial Year 2026 (Aug 2025 - July 2026)"

#### **Search & Filter Bar** (White card below header)
- 🔍 **Search box**: Type anything to search through task names and comments
- 🔽 **Status dropdown**: Filter by status (All/Completed/In Progress/Not Started)
- Results update instantly as you type or select

#### **Key Metrics Cards** (4 cards in a row)
1. **Total KTLO Tasks** - Blue border, shows "45" tasks
2. **Triaged** - Green border, shows how many reviewed (e.g., "38" - 84.4%)
3. **Needs CCS Action** - Orange border, shows actionable items
4. **Completed** - Green border, shows completion rate

#### **Urgent Alerts** (Red banner - only appears if needed)
- Shows if any tasks are overdue
- Shows if any tasks are due this week
- Example: "🚨 2 task(s) are overdue" + "⚡ 3 task(s) due this week"

#### **Charts Section - Row 1** (2 charts side by side)

**Left: Status Distribution (Pie Chart)**
- Green slice: Completed tasks
- Blue slice: In Progress tasks
- Yellow slice: Not Started tasks
- Hover over any slice to see exact numbers
- Labels show count and percentage

**Right: Upcoming Deadlines (Bar Chart)**
- Red bar: Overdue tasks
- Orange bar: Due this week
- Yellow bar: Due this month
- Green bar: Due this quarter
- Hover to see exact counts

#### **Charts Section - Row 2** (2 charts side by side)

**Left: Tasks by Program Manager**
- Vertical bar chart
- Each bar represents a team member
- Shows workload distribution
- Based on your data: Srinivas Gunda, Umang Jain, etc.

**Right: Top AWS Services**
- Horizontal bar chart
- Top 10 most frequently deprecated services
- Examples from your data:
  - EKS Kubernetes version updates
  - Lambda runtime deprecations
  - RDS PostgreSQL updates
  - ACM Certificate renewals

#### **Task List Table** (Bottom section)
- Full searchable, filterable table
- Columns:
  - KTLO Item name
  - Status (color-coded badge)
  - PgM Assigned
  - Due Date (red if overdue)
  - CCS Action needed (Yes/No badge)
- **Red background rows** = Overdue tasks
- **Click any row** to open detailed view

### 💡 Interactive Features

#### **1. Click on Any Task Row**
Opens a modal popup showing:
- Full task description
- All details: Status, Triaged, CCS Action, PgM, Dates
- Complete comments from your tracker
- Click X or outside to close

#### **2. Hover on Charts**
- Tooltips appear showing exact numbers
- Works on all charts (pie, bar, line)

#### **3. Real-time Search**
Try typing:
- "EKS" - See all Kubernetes-related tasks
- "Lambda" - Filter to Lambda deprecations
- "PostgreSQL" - Database-related items
- Any PgM name - See their tasks

#### **4. Status Filtering**
Use the dropdown to:
- See only completed work
- Focus on in-progress items
- Find tasks not yet started
- View all (default)

## 📊 Understanding Your Data

### Current Statistics (Based on Your Tracker)

From your 45 KTLO tasks:

**Status Breakdown:**
- ✅ Completed: ~30 tasks (66.7%)
- 🔄 In Progress: ~5 tasks (11.1%)
- ⏸️ Not Started: ~10 tasks (22.2%)

**Key Insights:**
1. **Most Active Services**: EKS, Lambda, RDS are top deprecation sources
2. **Primary PgMs**: Srinivas Gunda and Umang Jain handle most tasks
3. **Triage Rate**: 84.4% of tasks have been reviewed
4. **CCS Action**: About 75% of tasks need CCS involvement

### Sample Tasks in Your Dashboard

**Recent Completed:**
- MSK Clusters Patching
- Amazon Aurora PostgreSQL minor version deprecations
- RabbitMQ version 3.9 end of support
- AWS Lambda Node.js 18 end of support

**In Progress:**
- Migrate EKS AL2 Clusters
- Transition RDS Performance Insights
- Lambda Python 3.9 deprecation
- Atmos Staging Decommissioning

**Not Started:**
- Amazon EFS Elastic Throughput consideration
- OpenSearch Service updates
- AWS STS updates
- EKS Kubernetes 1.32 upgrade planning

## 🎨 Visual Indicators

### Color Meanings

**Status Badges:**
- 🟢 Green pill = Completed
- 🔵 Blue pill = In Progress
- 🟡 Yellow pill = Not Started

**CCS Action Badges:**
- 🟠 Orange pill = Yes (action needed)
- ⚪ Gray pill = No (no action needed)

**Date Highlighting:**
- 🔴 Red text = Overdue
- ⚫ Black text = On track

**Row Backgrounds:**
- 🔴 Light red background = Overdue task
- ⚪ White background = Normal

**Chart Colors:**
- Red = Urgent/Overdue
- Orange = Near-term (this week)
- Yellow = Medium-term (this month)
- Green = Long-term (this quarter)
- Blue = In Progress
- Purple = PgM assignments
- Pink = AWS Services

## 📅 Timeline Categories

**Overdue:**
- Due date passed
- Status ≠ Completed
- Highlighted in red throughout dashboard

**This Week:**
- Due within next 7 days
- Status ≠ Completed
- Shown in orange

**This Month:**
- Due within next 30 days
- Excludes "this week" items
- Shown in yellow

**This Quarter:**
- Due within next 90 days
- Excludes "this month" items
- Shown in green

## 🔄 Updating the Dashboard

### When You Update Your Excel Tracker

**Step 1:** Update your KTLO Tracker.xlsx file as usual

**Step 2:** Re-extract the data
```bash
node extract-data.js
```

**Step 3:** The dashboard will auto-refresh
- Vite dev server watches for file changes
- Dashboard updates automatically in browser
- If not, refresh the page (Cmd+R or F5)

### What Gets Updated

When you re-extract:
- ✅ All metrics recalculate
- ✅ All charts update
- ✅ Task list refreshes
- ✅ Filters reset (search cleared)

## 💻 Browser Tips

**Best Experience:**
- Use Chrome, Firefox, Safari, or Edge (latest versions)
- Minimum screen width: 1280px recommended
- Works on mobile but desktop is optimal

**Keyboard Shortcuts:**
- Click search box and start typing (no need to click first)
- ESC key closes the detail modal
- Click outside modal to close
- Tab to navigate form elements

## 🎓 Best Practices

### For Program Managers

1. **Daily Check**: Look at "Upcoming Deadlines" chart
2. **Weekly Review**: Check "Tasks by Program Manager" for balance
3. **Filter Your Tasks**: Search by your name to see your workload
4. **Monitor Overdue**: Red alert banner shows urgent items

### For Team Leads

1. **Completion Tracking**: Monitor green completion percentage
2. **Service Trends**: Review "Top AWS Services" for planning
3. **Workload Balance**: Check PgM distribution chart
4. **CCS Actions**: Filter to see items needing team action

### For Executives

1. **High-Level Metrics**: Focus on 4 metric cards at top
2. **Status Overview**: Glance at pie chart for health check
3. **Risk Assessment**: Look at overdue/urgent counts
4. **Trend Analysis**: Compare completion rate over time

## 🚀 Advanced Usage

### Combining Filters

You can combine search and status filter:
1. Select "In Progress" from dropdown
2. Type "EKS" in search
3. See only in-progress EKS tasks

### Export Data (Manual)

Currently, to export filtered results:
1. Apply your filters
2. Task list shows filtered items
3. You can copy/paste from table
4. Or screenshot the view

### Custom Analysis

Want to analyze specific areas?
- **By Service**: Search "EKS", "Lambda", "RDS", etc.
- **By PgM**: Search "Srinivas", "Umang", etc.
- **By Urgency**: Look at timeline chart colors
- **By Status**: Use status filter dropdown

## 📊 Sample Queries to Try

**Find all EKS tasks:**
- Type "EKS" in search → Shows all Kubernetes-related items

**See what's urgent:**
- Look at red alert banner → Lists overdue + this week items

**Check your workload:**
- Search your name → Shows all your assigned tasks

**Find completed RDS work:**
- Select "Completed" from dropdown
- Type "RDS" in search
- Shows all finished database tasks

**Lambda deprecations:**
- Type "Lambda" → All Lambda runtime end-of-life items

## 🆘 Common Questions

**Q: Why don't I see my latest Excel changes?**
A: Run `node extract-data.js` to re-extract the data.

**Q: Can I edit tasks in the dashboard?**
A: Not yet - this is read-only. Edit Excel file, then re-extract.

**Q: How often should I update?**
A: Update Excel weekly, re-extract before important meetings.

**Q: Can I share this dashboard?**
A: Currently runs locally. To share, you'd need to deploy it (see deployment options in README).

**Q: What if I add new columns to Excel?**
A: The dashboard will still work but won't show new columns unless you update the code.

**Q: Can I change the fiscal year dates?**
A: Yes, edit the subtitle text in `src/KtloDashboard.tsx` line ~217

## 🎉 Quick Wins

Start using these features immediately:

1. **Urgent Alert**: Check red banner each morning
2. **Search**: Find tasks instantly by name or keyword
3. **Click Tasks**: Get full details in popup modal
4. **Status Filter**: Focus on active work
5. **Chart Tooltips**: Hover for exact numbers

---

**Need Help?** Check the README.md for technical details and troubleshooting.
