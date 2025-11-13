import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  CheckCircle2, AlertTriangle, TrendingUp, Calendar, Filter, Search,
  ExternalLink, X, Clock, Users, FileText, Activity,
  CheckSquare, Target, Zap, ArrowUpRight, AlertCircle, RefreshCw
} from 'lucide-react';

// Import data - falls back to empty array if import fails
import ktloDataImport from './ktlo-data.json';
const ktloData: any[] = Array.isArray(ktloDataImport) ? ktloDataImport : [];

// Type definitions
interface KTLOItem {
  'KTLO Item': string;
  'Received On': number;
  'Triaged': string;
  'Action Needed from CCS': string;
  'Status': string;
  'Comments'?: string;
  'Due Date'?: number | string;
  'PgM Assigned'?: string;
}

// Utility functions
const excelDateToJSDate = (excelDate: number): Date => {
  return new Date((excelDate - 25569) * 86400 * 1000);
};

const formatDate = (excelDate: number | string): string => {
  if (typeof excelDate === 'string') return excelDate;
  const date = excelDateToJSDate(excelDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const extractJiraId = (comments?: string): string | null => {
  if (!comments) return null;
  const jiraMatch = comments.match(/(?:GWCP|RE|BITS)-\d+/i);
  return jiraMatch ? jiraMatch[0] : null;
};

const getFiscalYear = (date: Date): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (month >= 7) {
    return `FY${(year + 1).toString().slice(-2)}`;
  }
  return `FY${year.toString().slice(-2)}`;
};

const getAllFiscalYears = (data: KTLOItem[]): string[] => {
  const years = new Set<string>();
  data.forEach(item => {
    if (typeof item['Received On'] === 'number') {
      const date = excelDateToJSDate(item['Received On']);
      years.add(getFiscalYear(date));
    }
  });
  return Array.from(years).sort().reverse();
};

const getUrgencyLevel = (item: KTLOItem): 'overdue' | 'urgent' | 'soon' | 'normal' => {
  if (item.Status === 'Completed') return 'normal';
  if (typeof item['Due Date'] !== 'number') return 'normal';

  const now = new Date();
  const dueDate = excelDateToJSDate(item['Due Date']);
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'urgent';
  if (daysUntilDue <= 30) return 'soon';
  return 'normal';
};

const KtloDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set(['Completed', 'In Progress', 'Not Started']));
  const [fiscalYearFilter, setFiscalYearFilter] = useState<string>('FY26');
  const [selectedItem, setSelectedItem] = useState<KTLOItem | null>(null);
  const [drillDownData, setDrillDownData] = useState<{
    items: KTLOItem[];
    title: string;
  } | null>(null);

  // Check if data is available
  if (!ktloData || ktloData.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border-2 border-red-200">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
              No Data Available
            </h2>
            <p className="text-slate-600 mb-6 text-center">
              The KTLO dashboard data file could not be loaded. Please ensure <code className="bg-slate-100 px-2 py-1 rounded text-sm">src/ktlo-data.json</code> exists and contains valid data.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900 font-semibold mb-2">To fix this:</p>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Run <code className="bg-blue-100 px-1 rounded">node extract-data.js</code></li>
                <li>Or copy <code className="bg-blue-100 px-1 rounded">src/ktlo-data.sample.json</code> to <code className="bg-blue-100 px-1 rounded">src/ktlo-data.json</code></li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Page
            </button>
          </div>
        </div>
      </main>
    );
  }

  const allFiscalYears = useMemo(() => getAllFiscalYears(ktloData as KTLOItem[]), []);

  const toggleStatusFilter = (status: string) => {
    const newFilters = new Set(statusFilters);
    if (newFilters.has(status)) {
      newFilters.delete(status);
    } else {
      newFilters.add(status);
    }
    setStatusFilters(newFilters);
  };

  // Process data with filters
  const processedData = useMemo(() => {
    let filtered = (ktloData as KTLOItem[]).filter(item => {
      if (fiscalYearFilter !== 'All') {
        if (typeof item['Received On'] === 'number') {
          const date = excelDateToJSDate(item['Received On']);
          const fy = getFiscalYear(date);
          if (fy !== fiscalYearFilter) return false;
        }
      }

      const itemStatus = item.Status || 'Not Started';
      if (statusFilters.size > 0 && !statusFilters.has(itemStatus)) return false;

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const itemText = item['KTLO Item'].toLowerCase();
        const comments = (item.Comments || '').toLowerCase();
        const pgm = (item['PgM Assigned'] || '').toLowerCase();
        if (!itemText.includes(search) && !comments.includes(search) && !pgm.includes(search)) {
          return false;
        }
      }

      return true;
    });

    const total = filtered.length;
    const triaged = filtered.filter(item => item.Triaged === 'Yes').length;
    const ccsAction = filtered.filter(item => item['Action Needed from CCS'] === 'Yes').length;
    const completed = filtered.filter(item => item.Status === 'Completed').length;
    const inProgress = filtered.filter(item => item.Status === 'In Progress').length;
    const notStarted = filtered.filter(item => item.Status === 'Not Started' || !item.Status).length;

    const now = new Date();
    const overdue = filtered.filter(item => {
      if (item.Status === 'Completed') return false;
      if (typeof item['Due Date'] !== 'number') return false;
      const dueDate = excelDateToJSDate(item['Due Date']);
      return dueDate < now;
    });

    const due7Days = filtered.filter(item => {
      if (item.Status === 'Completed') return false;
      if (typeof item['Due Date'] !== 'number') return false;
      const dueDate = excelDateToJSDate(item['Due Date']);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    const due30Days = filtered.filter(item => {
      if (item.Status === 'Completed') return false;
      if (typeof item['Due Date'] !== 'number') return false;
      const dueDate = excelDateToJSDate(item['Due Date']);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 7 && daysUntilDue <= 30;
    });

    const due90Days = filtered.filter(item => {
      if (item.Status === 'Completed') return false;
      if (typeof item['Due Date'] !== 'number') return false;
      const dueDate = excelDateToJSDate(item['Due Date']);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 30 && daysUntilDue <= 90;
    });

    const pgmCounts: { [key: string]: number } = {};
    filtered.forEach(item => {
      const pgm = item['PgM Assigned'] || 'Unassigned';
      pgmCounts[pgm] = (pgmCounts[pgm] || 0) + 1;
    });
    const pgmData = Object.entries(pgmCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const statusData = [
      { name: 'Completed', value: completed, color: '#10b981' },
      { name: 'In Progress', value: inProgress, color: '#3b82f6' },
      { name: 'Not Started', value: notStarted, color: '#f59e0b' }
    ].filter(item => item.value > 0);

    return {
      filtered,
      metrics: {
        total,
        triaged,
        triagedPercent: total > 0 ? Math.round((triaged / total) * 100) : 0,
        ccsAction,
        completed,
        completedPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        inProgress,
        notStarted,
        overdue: overdue.length,
        due7Days: due7Days.length,
        due30Days: due30Days.length,
        due90Days: due90Days.length
      },
      charts: {
        statusData,
        pgmData
      },
      lists: {
        overdue,
        due7Days,
        due30Days,
        due90Days,
        ccsAction: filtered.filter(item => item['Action Needed from CCS'] === 'Yes'),
        completed: filtered.filter(item => item.Status === 'Completed')
      }
    };
  }, [searchTerm, statusFilters, fiscalYearFilter]);

  const handleDrillDown = (items: KTLOItem[], title: string) => {
    setDrillDownData({ items, title });
  };

  return (
    <>
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none z-10">
                <Search className="text-slate-400 w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search tasks, comments, PgM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="relative flex items-center">
              <div className="absolute left-3 pointer-events-none z-10">
                <Calendar className="text-slate-400 w-5 h-5" />
              </div>
              <select
                value={fiscalYearFilter}
                onChange={(e) => setFiscalYearFilter(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer transition-all"
              >
                <option value="All">All Fiscal Years</option>
                {allFiscalYears.map(fy => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </div>

            <div className="bg-white border border-slate-300 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Filter className="text-slate-400 w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-600">Filter by Status:</span>
              </div>
              <div className="space-y-1.5">
                {['Completed', 'In Progress', 'Not Started'].map(status => (
                  <label key={status} className="flex items-center space-x-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={statusFilters.has(status)}
                      onChange={() => toggleStatusFilter(status)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm text-slate-700 group-hover:text-slate-900">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Banner */}
          {processedData.metrics.overdue > 0 && (
            <div
              onClick={() => handleDrillDown(processedData.lists.overdue, 'Overdue Tasks')}
              className="bg-red-50 border border-red-200 rounded-lg p-4 cursor-pointer hover:bg-red-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-900">
                    {processedData.metrics.overdue} task{processedData.metrics.overdue !== 1 ? 's' : ''} overdue
                  </p>
                  <p className="text-xs text-red-700">Click to view details</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tasks */}
          <div
            onClick={() => handleDrillDown(processedData.filtered, 'All KTLO Tasks')}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Total Tasks</h3>
            <p className="text-3xl font-bold text-slate-900">{processedData.metrics.total}</p>
            <p className="text-xs text-slate-500 mt-1">{fiscalYearFilter !== 'All' ? fiscalYearFilter : 'All Years'}</p>
          </div>

          {/* Triaged */}
          <div
            onClick={() => handleDrillDown(
              processedData.filtered.filter(item => item.Triaged === 'Yes'),
              'Triaged Tasks'
            )}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckSquare className="w-6 h-6 text-emerald-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Triaged</h3>
            <p className="text-3xl font-bold text-slate-900">{processedData.metrics.triaged}</p>
            <p className="text-xs text-emerald-600 mt-1">{processedData.metrics.triagedPercent}% of total</p>
          </div>

          {/* CCS Action */}
          <div
            onClick={() => handleDrillDown(processedData.lists.ccsAction, 'CCS Action Required')}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-orange-600 transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">CCS Action</h3>
            <p className="text-3xl font-bold text-slate-900">{processedData.metrics.ccsAction}</p>
            <p className="text-xs text-slate-500 mt-1">Requires team action</p>
          </div>

          {/* Completed */}
          <div
            onClick={() => handleDrillDown(processedData.lists.completed, 'Completed Tasks')}
            className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">Completed</h3>
            <p className="text-3xl font-bold text-slate-900">{processedData.metrics.completed}</p>
            <p className="text-xs text-emerald-600 mt-1">{processedData.metrics.completedPercent}% completion</p>
          </div>
        </div>

        {/* Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div
            onClick={() => handleDrillDown(processedData.lists.overdue, 'Overdue Tasks')}
            className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-3xl font-bold text-red-700">{processedData.metrics.overdue}</span>
            </div>
            <h3 className="text-sm font-semibold text-red-900">Overdue</h3>
            <p className="text-xs text-red-700 mt-1">Past due date</p>
          </div>

          <div
            onClick={() => handleDrillDown(processedData.lists.due7Days, 'Due in 7 Days')}
            className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-3xl font-bold text-orange-700">{processedData.metrics.due7Days}</span>
            </div>
            <h3 className="text-sm font-semibold text-orange-900">Due in 7 Days</h3>
            <p className="text-xs text-orange-700 mt-1">Urgent attention needed</p>
          </div>

          <div
            onClick={() => handleDrillDown(processedData.lists.due30Days, 'Due in 30 Days')}
            className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-3xl font-bold text-yellow-700">{processedData.metrics.due30Days}</span>
            </div>
            <h3 className="text-sm font-semibold text-yellow-900">Due in 30 Days</h3>
            <p className="text-xs text-yellow-700 mt-1">Plan ahead</p>
          </div>

          <div
            onClick={() => handleDrillDown(processedData.lists.due90Days, 'Due in 90 Days')}
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-3xl font-bold text-green-700">{processedData.metrics.due90Days}</span>
            </div>
            <h3 className="text-sm font-semibold text-green-900">Due in 90 Days</h3>
            <p className="text-xs text-green-700 mt-1">Long-term planning</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Status Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Status Distribution</h2>
              <Activity className="w-5 h-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processedData.charts.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={(data) => {
                    const items = processedData.filtered.filter(item => {
                      if (data.name === 'Completed') return item.Status === 'Completed';
                      if (data.name === 'In Progress') return item.Status === 'In Progress';
                      return item.Status === 'Not Started' || !item.Status;
                    });
                    handleDrillDown(items, `${data.name} Tasks`);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {processedData.charts.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-slate-500 mt-2">Click segments to filter tasks</p>
          </div>

          {/* Tasks by PgM */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Tasks by Program Manager</h2>
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processedData.charts.pgmData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[6, 6, 0, 0]}
                  onClick={(data) => {
                    const items = processedData.filtered.filter(
                      item => (item['PgM Assigned'] || 'Unassigned') === data.name
                    );
                    handleDrillDown(items, `${data.name}'s Tasks`);
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-center text-slate-500 mt-2">Click bars to view tasks</p>
          </div>
        </div>

        {/* Task Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">All Tasks</h2>
              <span className="text-sm text-slate-500">{processedData.filtered.length} tasks</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Task</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">PgM</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">CCS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Jira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {processedData.filtered.map((item, idx) => {
                  const urgency = getUrgencyLevel(item);
                  const jiraId = extractJiraId(item.Comments);

                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedItem(item)}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                        urgency === 'overdue' ? 'bg-red-50' :
                        urgency === 'urgent' ? 'bg-orange-50' :
                        urgency === 'soon' ? 'bg-yellow-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-900">{item['KTLO Item']}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.Status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          item.Status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {item.Status || 'Not Started'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700">{item['PgM Assigned'] || 'Unassigned'}</td>
                      <td className="px-6 py-4 text-sm">
                        {typeof item['Due Date'] === 'number' ? (
                          <span className={
                            urgency === 'overdue' ? 'text-red-700 font-semibold' :
                            urgency === 'urgent' ? 'text-orange-700 font-semibold' :
                            urgency === 'soon' ? 'text-yellow-700' : 'text-slate-700'
                          }>
                            {formatDate(item['Due Date'])}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item['Action Needed from CCS'] === 'Yes' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item['Action Needed from CCS'] || 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {jiraId ? (
                          <a
                            href={`https://jira.yourcompany.com/browse/${jiraId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {jiraId}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Drill-Down Modal */}
      {drillDownData && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setDrillDownData(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{drillDownData.title}</h2>
              <button
                onClick={() => setDrillDownData(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <p className="text-sm text-slate-600 mb-4">
                {drillDownData.items.length} task{drillDownData.items.length !== 1 ? 's' : ''} found
              </p>

              <div className="space-y-3">
                {drillDownData.items.map((item, idx) => {
                  const urgency = getUrgencyLevel(item);
                  const jiraId = extractJiraId(item.Comments);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedItem(item)}
                      className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                        urgency === 'overdue' ? 'bg-red-50 border-red-200 hover:border-red-400' :
                        urgency === 'urgent' ? 'bg-orange-50 border-orange-200 hover:border-orange-400' :
                        urgency === 'soon' ? 'bg-yellow-50 border-yellow-200 hover:border-yellow-400' :
                        'bg-white border-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <h3 className="font-medium text-slate-900 mb-2">{item['KTLO Item']}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.Status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          item.Status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {item.Status || 'Not Started'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
                          {item['PgM Assigned'] || 'Unassigned'}
                        </span>
                        {typeof item['Due Date'] === 'number' && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            urgency === 'overdue' ? 'bg-red-100 text-red-800' :
                            urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                            urgency === 'soon' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            Due: {formatDate(item['Due Date'])}
                          </span>
                        )}
                        {jiraId && (
                          <a
                            href={`https://jira.yourcompany.com/browse/${jiraId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 hover:bg-blue-200"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {jiraId}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Task Details</h2>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">{selectedItem['KTLO Item']}</h3>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Status</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedItem.Status || 'Not Started'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Program Manager</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedItem['PgM Assigned'] || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Triaged</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedItem.Triaged || 'No'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">CCS Action</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedItem['Action Needed from CCS'] || 'No'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Received On</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {typeof selectedItem['Received On'] === 'number' ? formatDate(selectedItem['Received On']) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Due Date</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {typeof selectedItem['Due Date'] === 'number' ? formatDate(selectedItem['Due Date']) : '-'}
                  </p>
                </div>
              </div>

              {selectedItem.Comments && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-medium text-slate-500 mb-2">Comments</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedItem.Comments}</p>
                </div>
              )}

              {extractJiraId(selectedItem.Comments) && (
                <a
                  href={`https://jira.yourcompany.com/browse/${extractJiraId(selectedItem.Comments)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View in Jira: {extractJiraId(selectedItem.Comments)}
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KtloDashboard;
