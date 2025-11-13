import { useState } from 'react';
import { Database, List, BarChart3 } from 'lucide-react';
import KtloDashboard from './KtloDashboard';
import { DatabaseDashboard } from './DatabaseDashboard';
import auroraDataSample from './aurora-data.sample.json';
import './style.css';

// Import aurora data with fallback to sample data
const dataModules = import.meta.glob('./aurora-data.json', { eager: true, import: 'default' });
const auroraData = dataModules['./aurora-data.json']
  ? (dataModules['./aurora-data.json'] as any)
  : auroraDataSample;

function App() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'databases'>('tasks');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modern Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">KTLO Dashboard</h1>
                <p className="text-xs text-slate-500">AWS Operations Tracker</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation - Enhanced with visual prominence */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-2">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'tasks'
                    ? 'bg-white text-blue-600 shadow-lg border-t-4 border-blue-500 transform -translate-y-1'
                    : 'bg-transparent text-slate-600 hover:bg-white/50 hover:text-slate-900 border-t-4 border-transparent'
                }`}
              >
                <List className={`w-5 h-5 ${activeTab === 'tasks' ? 'animate-pulse-once' : ''}`} />
                <span>KTLO Tasks</span>
                {activeTab === 'tasks' && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    Active
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('databases')}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-semibold text-sm transition-all duration-200 ${
                  activeTab === 'databases'
                    ? 'bg-white text-blue-600 shadow-lg border-t-4 border-blue-500 transform -translate-y-1'
                    : 'bg-transparent text-slate-600 hover:bg-white/50 hover:text-slate-900 border-t-4 border-transparent'
                }`}
              >
                <Database className={`w-5 h-5 ${activeTab === 'databases' ? 'animate-pulse-once' : ''}`} />
                <span>Database Versions</span>
                {activeTab === 'databases' && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                    Active
                  </span>
                )}
              </button>
            </div>
            <div className="text-xs text-slate-500 italic mt-2 ml-1">
              ↑ Click tabs above to switch between dashboards
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'tasks' && <KtloDashboard />}
      {activeTab === 'databases' && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DatabaseDashboard auroraData={auroraData as any} />
        </main>
      )}
    </div>
  );
}

export default App;
