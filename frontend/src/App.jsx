import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/layout/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SpeechTest from './pages/SpeechTest';
import TestsPage from './pages/TestsPage';
import FacialAnalysis from './pages/FacialAnalysis';
import DualTasksPage from './pages/DualTasksPage';
import BrainGamesPage from './pages/BrainGamesPage';
import Settings from './pages/Settings';
import MemoryRecallTest from './pages/MemoryRecallTest';
import ReactionTimeTest from './pages/ReactionTimeTest';
import NumberSequenceTest from './pages/NumberSequenceTest';
import WordFluencyTest from './pages/WordFluencyTest';
import PatternMatchTest from './pages/PatternMatchTest';

// Final mock pages until fully built
const Training = () => <div className="p-8 text-2xl font-bold">Brain Training Center (Coming Soon)</div>;
const Caregiver = () => <div className="p-8 text-2xl font-bold">Caregiver Portal (Coming Soon)</div>;

const Progress = () => (
  <div className="p-8 space-y-6 max-w-5xl mx-auto">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Progress Analytics</h2>
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
      <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">Weekly Score Trend</h3>
      <div className="h-64 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
        <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          Loading Chart Data...
        </span>
      </div>
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {['Memory Recall', 'Speech Clarity', 'Reaction Time'].map((m) => (
          <div key={m} className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20">
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{m}</p>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-slate-200 mt-2">+12%</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Reports = () => (
  <div className="p-8 space-y-6 max-w-5xl mx-auto">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Doctor Reports</h2>
    <p className="text-slate-500 dark:text-slate-400">Download and review your monthly clinical evaluations.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {[1, 2].map((i) => (
         <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between items-start gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Clinical Evaluation - Mar 2026</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Reviewed by Dr. Sharma, Neurologist</p>
              <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                 Stable Condition
              </div>
            </div>
            <button className="w-full sm:w-auto text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium text-sm bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 px-4 py-2.5 rounded-xl transition-colors">
              Download PDF Report
            </button>
         </div>
      ))}
    </div>
  </div>
);

function App() {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes inside Layout */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="speech" element={<SpeechTest />} />
          <Route path="cognitive" element={<TestsPage />} />
          <Route path="facial" element={<FacialAnalysis />} />
          <Route path="training" element={<Training />} />
          <Route path="dualtasks" element={<DualTasksPage />} />
          <Route path="braingames" element={<BrainGamesPage />} />
          <Route path="test/memory" element={<MemoryRecallTest />} />
          <Route path="test/reaction" element={<ReactionTimeTest />} />
          <Route path="test/sequence" element={<NumberSequenceTest />} />
          <Route path="test/fluency" element={<WordFluencyTest />} />
          <Route path="test/pattern" element={<PatternMatchTest />} />
          <Route path="progress" element={<Progress />} />
          <Route path="caregiver" element={<Caregiver />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Catch-all redirect to Handle nested dashboard imports simply */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
