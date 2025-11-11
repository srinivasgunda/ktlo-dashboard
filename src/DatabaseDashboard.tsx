import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Database, Server, AlertCircle, CheckCircle, Settings, X
} from 'lucide-react';

// Type definitions
interface AuroraDBInstance {
  environment: string;
  autoMinorVersionUpgrade: boolean;
  dbInstanceIdentifier: string;
  engineVersion: string;
  compliant: boolean;
}

interface DatabaseDashboardProps {
  auroraData: AuroraDBInstance[];
}

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

export const DatabaseDashboard: React.FC<DatabaseDashboardProps> = ({ auroraData }) => {
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>('All');
  const [selectedDB, setSelectedDB] = useState<AuroraDBInstance | null>(null);

  const processedData = useMemo(() => {
    // Mark compliance status
    const withCompliance = auroraData.map(db => ({
      ...db,
      compliant: isCompliant(db.engineVersion)
    }));

    // Filter by environment
    const filtered = selectedEnvironment === 'All'
      ? withCompliance
      : withCompliance.filter(db => db.environment === selectedEnvironment);

    const total = filtered.length;
    const nonCompliant = filtered.filter(db => !db.compliant).length;
    const autoUpgradeEnabled = filtered.filter(db => db.autoMinorVersionUpgrade).length;
    const autoUpgradeDisabled = total - autoUpgradeEnabled;

    // Version distribution
    const versionCounts: { [key: string]: number } = {};
    filtered.forEach(db => {
      const major = getMajorVersion(db.engineVersion);
      const label = VERSION_COMPLIANCE[major]?.label || `v${major}`;
      versionCounts[label] = (versionCounts[label] || 0) + 1;
    });

    const versionData = Object.entries(versionCounts)
      .map(([version, count]) => ({ version, count }))
      .sort((a, b) => b.count - a.count);

    // Environment distribution
    const envCounts: { [key: string]: number } = {};
    filtered.forEach(db => {
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

    return {
      filtered,
      metrics: {
        total,
        nonCompliant,
        compliantPercent: total > 0 ? Math.round(((total - nonCompliant) / total) * 100) : 0,
        autoUpgradeEnabled,
        autoUpgradeDisabled,
        autoUpgradePercent: total > 0 ? Math.round((autoUpgradeEnabled / total) * 100) : 0
      },
      charts: {
        versionData,
        envData: envData.map(item => ({
          ...item,
          color: envColors[item.name.toLowerCase()] || '#64748b'
        }))
      }
    };
  }, [auroraData, selectedEnvironment]);

  const environments = useMemo(() => {
    const envs = new Set(auroraData.map(db => db.environment));
    return ['All', ...Array.from(envs).sort()];
  }, [auroraData]);

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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Total DB Instances</h3>
          <p className="text-3xl font-bold text-slate-900">{processedData.metrics.total}</p>
          <p className="text-xs text-slate-500 mt-1">{selectedEnvironment} environment{selectedEnvironment === 'All' ? 's' : ''}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Non-Compliant</h3>
          <p className="text-3xl font-bold text-red-600">{processedData.metrics.nonCompliant}</p>
          <p className="text-xs text-emerald-600 mt-1">{processedData.metrics.compliantPercent}% compliant</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Auto-Upgrade ON</h3>
          <p className="text-3xl font-bold text-emerald-600">{processedData.metrics.autoUpgradeEnabled}</p>
          <p className="text-xs text-slate-500 mt-1">{processedData.metrics.autoUpgradePercent}% enabled</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">Auto-Upgrade OFF</h3>
          <p className="text-3xl font-bold text-orange-600">{processedData.metrics.autoUpgradeDisabled}</p>
          <p className="text-xs text-slate-500 mt-1">Manual upgrade required</p>
        </div>
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
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-slate-500 mt-2">Instances per major version</p>
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
              >
                {processedData.charts.envData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-center text-slate-500 mt-2">DB instances by environment</p>
        </div>
      </div>

      {/* Database Instances Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Database Instances</h3>
          <p className="text-sm text-slate-500 mt-1">{processedData.filtered.length} instances</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Instance ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Environment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Compliance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Auto-Upgrade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processedData.filtered.map((db, idx) => (
                <tr
                  key={idx}
                  onClick={() => setSelectedDB(db)}
                  className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                    !db.compliant ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{db.dbInstanceIdentifier}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {db.environment}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 font-mono">{db.engineVersion}</td>
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
              ))}
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
                  <p className="text-xs font-medium text-slate-500 mb-1">Environment</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{selectedDB.environment}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Engine Version</p>
                  <p className="text-sm font-semibold text-slate-900 font-mono">{selectedDB.engineVersion}</p>
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

              {!selectedDB.compliant && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-900">Action Required</p>
                      <p className="text-sm text-red-700 mt-1">
                        This database version is approaching or past end-of-life. Consider upgrading to a supported version (v15, v16, or v17).
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
