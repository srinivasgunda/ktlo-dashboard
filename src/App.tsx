import { useState } from 'react';
import { Database, List, BarChart3 } from 'lucide-react';
import KtloDashboard from './KtloDashboard';
import { DatabaseDashboard } from './DatabaseDashboard';
import auroraData from './aurora-data.json';
import './style.css';

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

      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'tasks'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <List className="w-4 h-4" />
              KTLO Tasks
            </button>
            <button
              onClick={() => setActiveTab('databases')}
              className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'databases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Database Versions
            </button>
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
