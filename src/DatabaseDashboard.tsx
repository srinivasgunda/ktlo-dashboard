import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Database, Server, AlertCircle, CheckCircle, Settings, X, Clock, Calendar, RefreshCw
} from 'lucide-react';

// Type definitions
interface AuroraDBInstance {
  environment: string;
  autoMinorVersionUpgrade: boolean;
  dbInstanceIdentifier: string;
  engineVersion: string;
  owner: string;
  endOfStandardSupport: string;
  compliant: boolean;
}

interface DatabaseDashboardProps {
  auroraData: AuroraDBInstance[];
}

// Filter types
type FilterType = 'all' | 'compliant' | 'non-compliant' | 'auto-upgrade-on' | 'auto-upgrade-off' | 'version' | 'environment' | 'eol-critical' | 'eol-warning' | 'eol-safe';

// PostgreSQL Version Support Status (as of 2024)
const VERSION_COMPLIANCE: { [key: string]: { supported: boolean; eolDate: string; label: string } } = {
  '17': { supported: true, eolDate: '2029-11', label: 'v17 (Current)' },
  '16': { supported: true, eolDate: '2028-11', label: 'v16 (Supported)' },
  '15': { supported: true, eolDate: '2027-11', label: 'v15 (Supported)' },
  '14': { supported: true, eolDate: '2026-11', label: 'v14 (Older)' },
  '13': { supported: false, eolDate: '2025-11', label: 'v13 (EOL Soon)' },
  '12': { supported: false, eolDate: '2024-11', label: 'v12 (EOL)' },
};

const getMajorVersion = (version: string): string => {
  return version.split('.')[0];
};

const isCompliant = (version: string): boolean => {
  const major = getMajorVersion(version);
  return VERSION_COMPLIANCE[major]?.supported ?? false;
};

const getDaysUntilEOL = (eolDate: string): number => {
  if (eolDate === 'Unknown') return -1;
  const eol = new Date(eolDate);
  const now = new Date();
  const diff = eol.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getEOLUrgency = (daysUntilEOL: number): 'critical' | 'warning' | 'safe' => {
  if (daysUntilEOL < 0) return 'critical'; // Past EOL
  if (daysUntilEOL < 365) return 'critical'; // Less than 1 year
  if (daysUntilEOL < 730) return 'warning'; // Less than 2 years
  return 'safe';
};

export const DatabaseDashboard: React.FC<DatabaseDashboardProps> = ({ auroraData }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('All');
  const [selectedDB, setSelectedDB] = useState<AuroraDBInstance | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  const tableRef = React.useRef<HTMLDivElement>(null);

  // Check if data is available
  if (!auroraData || auroraData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full border-2 border-red-200">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-16 h-16 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 text-center">
            No Database Data Available
          </h2>
          <p className="text-slate-600 mb-6 text-center">
            The Aurora database data could not be loaded. Please ensure <code className="bg-slate-100 px-2 py-1 rounded text-sm">src/aurora-data.json</code> exists and contains valid data.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const processedData = useMemo(() => {
    // Mark compliance status
    const withCompliance = auroraData.map(db => ({
      ...db,
      compliant: isCompliant(db.engineVersion)
    }));

    // Filter by environment ONLY (for metrics calculation)
    const envFiltered = selectedEnvironment === 'All'
      ? withCompliance
      : withCompliance.filter(db => db.environment === selectedEnvironment);

    // Calculate metrics from environment-filtered data (NOT table-filtered)
    const total = envFiltered.length;
    const nonCompliant = envFiltered.filter(db => !db.compliant).length;
    const autoUpgradeEnabled = envFiltered.filter(db => db.autoMinorVersionUpgrade).length;
    const autoUpgradeDisabled = total - autoUpgradeEnabled;

    // EOL Urgency counts from environment-filtered data
    const eolCritical = envFiltered.filter(db => getEOLUrgency(getDaysUntilEOL(db.endOfStandardSupport)) === 'critical').length;
    const eolWarning = envFiltered.filter(db => getEOLUrgency(getDaysUntilEOL(db.endOfStandardSupport)) === 'warning').length;
    const eolSafe = envFiltered.filter(db => getEOLUrgency(getDaysUntilEOL(db.endOfStandardSupport)) === 'safe').length;

    // Apply active filter for TABLE display only
    let tableFiltered = [...envFiltered];
    if (activeFilter === 'compliant') {
      tableFiltered = tableFiltered.filter(db => db.compliant);
    } else if (activeFilter === 'non-compliant') {
      tableFiltered = tableFiltered.filter(db => !db.compliant);
    } else if (activeFilter === 'auto-upgrade-on') {
      tableFiltered = tableFiltered.filter(db => db.autoMinorVersionUpgrade);
    } else if (activeFilter === 'auto-upgrade-off') {
      tableFiltered = tableFiltered.filter(db => !db.autoMinorVersionUpgrade);
    } else if (activeFilter === 'version' && filterValue) {
      tableFiltered = tableFiltered.filter(db => getMajorVersion(db.engineVersion) === filterValue);
    } else if (activeFilter === 'environment' && filterValue) {
      tableFiltered = tableFiltered.filter(db => db.environment === filterValue);
    } else if (activeFilter === 'eol-critical') {
      tableFiltered = tableFiltered.filter(db => getEOLUrgency(getDaysUntilEOL(db.endOfStandardSupport)) === 'critical');
    } else if (activeFilter === 'eol-warning') {
      tableFiltered = tableFiltered.filter(db => getEOLUrgency(getDaysUntilEOL(db.endOfStandardSupport)) === 'warning');
    } else if (activeFilter === 'eol-safe') {
      tableFiltered = tableFiltered.filter(db => getEOLUrgency(getDaysUntilEOL(db.endOfStandardSupport)) === 'safe');
    }

    // Version distribution (from environment-filtered data)
    const versionCounts: { [key: string]: number } = {};
    envFiltered.forEach(db => {
      const major = getMajorVersion(db.engineVersion);
      const label = VERSION_COMPLIANCE[major]?.label || `v${major}`;
      versionCounts[label] = (versionCounts[label] || 0) + 1;
    });

    const versionData = Object.entries(versionCounts)
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => b.count - a.count);

    // Environment distribution (from environment-filtered data)
    const envCounts: { [key: string]: number } = {};
    envFiltered.forEach(db => {
      envCounts[db.environment] = (envCounts[db.environment] || 0) + 1;
    });

    const envData = Object.entries(envCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const envColors: { [key: string]: string } = {
      'dev': '#3b82f6',
      'test': '#10b981',
      'staging': '#f59e0b',
      'prod': '#ef4444',
      'production': '#ef4444'
    };

    // EOL Timeline data
    const eolTimelineData = [
      { urgency: 'Critical (< 1 year)', count: eolCritical, color: '#ef4444' },
      { urgency: 'Warning (1-2 years)', count: eolWarning, color: '#f59e0b' },
      { urgency: 'Safe (> 2 years)', count: eolSafe, color: '#10b981' }
    ];

    return {
      filtered: tableFiltered, // Table shows filtered data
      metrics: {
        total,
        nonCompliant,
        compliantPercent: total > 0 ? Math.round(((total - nonCompliant) / total) * 100) : 0,
        autoUpgradeEnabled,
        autoUpgradeDisabled,
        autoUpgradePercent: total > 0 ? Math.round((autoUpgradeEnabled / total) * 100) : 0,
        eolCritical,
        eolWarning,
        eolSafe
      },
      charts: {
        versionData,
        envData: envData.map(item => ({
          ...item,
          color: envColors[item.name.toLowerCase()] || '#64748b'
        })),
        eolTimelineData
      }
    };
  }, [auroraData, selectedEnvironment, activeFilter, filterValue]);

  const environments = useMemo(() => {
    const envs = new Set(auroraData.map(db => db.environment));
    return ['All', ...Array.from(envs).sort()];
  }, [auroraData]);

  const handleFilterClick = (filterType: FilterType, value?: string) => {
    if (activeFilter === filterType && filterValue === (value || '')) {
      // Clear filter if clicking the same one
      setActiveFilter('all');
      setFilterValue('');
    } else {
      setActiveFilter(filterType);
      setFilterValue(value || '');
      // Scroll to table after a short delay to ensure state update
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setFilterValue('');
  };

  // Get filter description for display
  const getFilterDescription = () => {
    if (activeFilter === 'all') return null;
    if (activeFilter === 'compliant') return 'Showing compliant databases';
    if (activeFilter === 'non-compliant') return 'Showing non-compliant databases';
    if (activeFilter === 'auto-upgrade-on') return 'Showing databases with auto-upgrade enabled';
    if (activeFilter === 'auto-upgrade-off') return 'Showing databases with auto-upgrade disabled';
    if (activeFilter === 'eol-critical') return 'Showing databases with critical EOL status (< 1 year)';
    if (activeFilter === 'eol-warning') return 'Showing databases with warning EOL status (1-2 years)';
    if (activeFilter === 'eol-safe') return 'Showing databases with safe EOL status (> 2 years)';
    if (activeFilter === 'version' && filterValue) return `Showing PostgreSQL version ${filterValue} databases`;
    if (activeFilter === 'environment' && filterValue) return `Showing databases in ${filterValue} environment`;
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Aurora PostgreSQL Versions
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Track database version compliance and auto-upgrade settings across environments
          </p>
        </div>
        <div className="flex items-center gap-4">
          {activeFilter !== 'all' && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          )}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Environment:</label>
            <select
              value={selectedEnvironment}
              onChange={(e) => setSelectedEnvironment(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {environments.map(env => (
                <option key={env} value={env}>{env}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'all' ? 'border-blue-500 shadow-md' : 'border-slate-200'
          }`}
          onClick={() => handleFilterClick('all')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Total DB Instances</h3>
          <p className="text-3xl font-bold text-slate-900">{processedData.metrics.total}</p>
          <p className="text-xs text-slate-500 mt-1">Click to show all</p>
        </div>

        <div
          className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'non-compliant' ? 'border-red-500 shadow-md' : 'border-slate-200'
          }`}
          onClick={() => handleFilterClick('non-compliant')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Non-Compliant</h3>
          <p className="text-3xl font-bold text-red-600">{processedData.metrics.nonCompliant}</p>
          <p className="text-xs text-emerald-600 mt-1">Click to filter</p>
        </div>

        <div
          className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'auto-upgrade-on' ? 'border-emerald-500 shadow-md' : 'border-slate-200'
          }`}
          onClick={() => handleFilterClick('auto-upgrade-on')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Auto-Upgrade ON</h3>
          <p className="text-3xl font-bold text-emerald-600">{processedData.metrics.autoUpgradeEnabled}</p>
          <p className="text-xs text-slate-500 mt-1">Click to filter</p>
        </div>

        <div
          className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-md ${
            activeFilter === 'auto-upgrade-off' ? 'border-orange-500 shadow-md' : 'border-slate-200'
          }`}
          onClick={() => handleFilterClick('auto-upgrade-off')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Auto-Upgrade OFF</h3>
          <p className="text-3xl font-bold text-orange-600">{processedData.metrics.autoUpgradeDisabled}</p>
          <p className="text-xs text-slate-500 mt-1">Click to filter</p>
        </div>
      </div>

      {/* EOL Timeline Widget */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-slate-900">End of Support Timeline</h3>
            <p className="text-sm text-slate-500">Database instances grouped by time until EOL</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              activeFilter === 'eol-critical' ? 'border-red-500 bg-red-50 shadow-md' : 'border-red-200 bg-red-50'
            }`}
            onClick={() => handleFilterClick('eol-critical')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{processedData.metrics.eolCritical}</p>
                <p className="text-xs text-slate-500">EOL &lt; 1 year</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              activeFilter === 'eol-warning' ? 'border-orange-500 bg-orange-50 shadow-md' : 'border-orange-200 bg-orange-50'
            }`}
            onClick={() => handleFilterClick('eol-warning')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Warning</p>
                <p className="text-2xl font-bold text-orange-600">{processedData.metrics.eolWarning}</p>
                <p className="text-xs text-slate-500">EOL 1-2 years</p>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              activeFilter === 'eol-safe' ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-emerald-200 bg-emerald-50'
            }`}
            onClick={() => handleFilterClick('eol-safe')}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600">Safe</p>
                <p className="text-2xl font-bold text-emerald-600">{processedData.metrics.eolSafe}</p>
                <p className="text-xs text-slate-500">EOL &gt; 2 years</p>
              </div>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={processedData.charts.eolTimelineData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="urgency" type="category" tick={{ fontSize: 12 }} width={150} />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {processedData.charts.eolTimelineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Version Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">PostgreSQL Version Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={processedData.charts.versionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="version" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
              <Bar
                dataKey="count"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
                onClick={(data) => {
                  if (data && data.version) {
                    const versionMatch = data.version.match(/v(\d+)/);
                    if (versionMatch) {
                      handleFilterClick('version', versionMatch[1]);
                    }
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-slate-500 mt-2">Click bars to filter by version</p>
        </div>

        {/* Environment Distribution */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Environment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData.charts.envData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => handleFilterClick('environment', data.name)}
                style={{ cursor: 'pointer' }}
              >
                {processedData.charts.envData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-slate-500 mt-2">Click segments to filter by environment</p>
        </div>
      </div>

      {/* Database Instances Table */}
      <div
        ref={tableRef}
        className={`bg-white rounded-lg border-2 overflow-hidden transition-all duration-300 ${
          activeFilter !== 'all'
            ? 'border-blue-500 shadow-lg shadow-blue-100'
            : 'border-slate-200'
        }`}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Database Instances</h3>
              <p className="text-sm text-slate-500 mt-1">
                {processedData.filtered.length} instances
                {activeFilter !== 'all' && ` of ${processedData.metrics.total} total`}
              </p>
            </div>
            {activeFilter !== 'all' && (
              <div className="flex items-center gap-2">
                <div className="px-4 py-2 bg-blue-100 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    🔍 {getFilterDescription()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Instance ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Environment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">EOL Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Days Until EOL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Auto-Upgrade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processedData.filtered.map((db, idx) => {
                const daysUntilEOL = getDaysUntilEOL(db.endOfStandardSupport);
                const eolUrgency = getEOLUrgency(daysUntilEOL);
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedDB(db)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      eolUrgency === 'critical' ? 'bg-red-50' : eolUrgency === 'warning' ? 'bg-orange-50' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{db.dbInstanceIdentifier}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 capitalize">{db.owner}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                        {db.environment}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700 font-mono">{db.engineVersion}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-700">{db.endOfStandardSupport}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        eolUrgency === 'critical'
                          ? 'bg-red-100 text-red-800'
                          : eolUrgency === 'warning'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {daysUntilEOL < 0 ? 'Past EOL' : `${daysUntilEOL} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        db.compliant
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {db.compliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        db.autoMinorVersionUpgrade
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {db.autoMinorVersionUpgrade ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDB && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setSelectedDB(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Database Instance Details</h2>
              <button
                onClick={() => setSelectedDB(null)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">{selectedDB.dbInstanceIdentifier}</h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Owner</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{selectedDB.owner}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Environment</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{selectedDB.environment}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Engine Version</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{selectedDB.engineVersion}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">End of Support Date</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedDB.endOfStandardSupport}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Days Until EOL</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {getDaysUntilEOL(selectedDB.endOfStandardSupport) < 0
                      ? 'Past EOL'
                      : `${getDaysUntilEOL(selectedDB.endOfStandardSupport)} days`}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Compliance Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDB.compliant
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedDB.compliant ? 'Compliant' : 'Non-Compliant'}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Auto Minor Version Upgrade</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDB.autoMinorVersionUpgrade
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedDB.autoMinorVersionUpgrade ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {getEOLUrgency(getDaysUntilEOL(selectedDB.endOfStandardSupport)) === 'critical' && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Critical: Immediate Action Required</p>
                      <p className="text-sm text-red-700 mt-1">
                        This database version is approaching or past end-of-life (less than 1 year remaining).
                        Upgrade immediately to a supported version (v15, v16, or v17) to maintain security and support.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {getEOLUrgency(getDaysUntilEOL(selectedDB.endOfStandardSupport)) === 'warning' && (
                <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">Warning: Plan Upgrade Soon</p>
                      <p className="text-sm text-orange-700 mt-1">
                        This database version has 1-2 years until end-of-life.
                        Plan an upgrade to a newer version (v16 or v17) to stay ahead of EOL.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!selectedDB.autoMinorVersionUpgrade && (
                <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-orange-900">Recommendation</p>
                      <p className="text-sm text-orange-700 mt-1">
                        Auto Minor Version Upgrade is disabled. Enable it to receive automatic security patches and bug fixes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
