import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../../store/useStore';
import { Activity, AlertTriangle, ArrowRight, Brain, Clock, HelpCircle, ShieldAlert, Sparkles, Mic, Bot } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const mockTrendData = [
  { name: 'Mon', score: 85 },
  { name: 'Tue', score: 82 },
  { name: 'Wed', score: 88 },
  { name: 'Thu', score: 84 },
  { name: 'Fri', score: 79 },
  { name: 'Sat', score: 81 },
  { name: 'Sun', score: 85 },
];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useStore();

  const riskScore = 85; 
  const riskLevel = "low"; // 'low' | 'medium' | 'high'
  
  const getRiskColor = () => {
    if (riskScore >= 80) return "text-emerald-500";
    if (riskScore >= 60) return "text-amber-500";
    return "text-rose-500";
  };
  const getRiskBg = () => {
    if (riskScore >= 80) return "bg-emerald-50 border-emerald-200";
    if (riskScore >= 60) return "bg-amber-50 border-amber-200";
    return "bg-rose-50 border-rose-200";
  };
  const getRiskLabel = () => {
    if (riskScore >= 80) return t('dashboard.low_risk');
    if (riskScore >= 60) return t('dashboard.medium_risk');
    return t('dashboard.high_risk');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{t('dashboard.welcome_back', 'Welcome Back')}, {user?.name?.split(' ')[0] || 'Caregiver'}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t('dashboard.health_summary', "Here's the cognitive health summary for today.")}</p>
        </div>
        <button className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all">
          <Bot className="w-4 h-4" />
          <span>{t('dashboard.ai_chatbot', 'AI Chat Assistant')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Risk Score Card */}
        <div className={`col-span-1 lg:col-span-1 border rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-sm dark:bg-slate-800 dark:border-slate-700 ${getRiskBg()}`}>
          <div className="absolute top-4 left-4">
             <ShieldAlert className={`w-6 h-6 ${getRiskColor()}`} />
          </div>
          <h2 className="text-slate-600 dark:text-slate-300 font-medium mb-2">{t('dashboard.overall_risk')}</h2>
          
          <div className="relative my-4">
             <svg className="w-40 h-40 transform -rotate-90">
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-slate-200 dark:text-slate-700" />
                <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" strokeDasharray="439.8" strokeDashoffset={439.8 - (439.8 * riskScore) / 100} className={getRiskColor()} strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">{riskScore}</span>
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1">{t('dashboard.score_label', 'Score')}</span>
             </div>
          </div>
          
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${getRiskColor()} bg-white bg-opacity-50`}>
             {getRiskLabel()} Risk
          </div>
        </div>

        {/* Trend Chart */}
        <div className="col-span-1 lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dashboard.weekly_trend', 'Weekly Trend')}</h2>
             <select className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded-lg px-2 py-1 outline-none">
                <option>{t('dashboard.last_7_days', 'Last 7 Days')}</option>
                <option>{t('dashboard.last_30_days', 'Last 30 Days')}</option>
             </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockTrendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12}} dx={-10} domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Explainability */}
        <div className="bg-white dark:bg-slate-800 border text-left border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
             <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
             </div>
             <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dashboard.why_this_score')}</h2>
          </div>
          <ul className="space-y-4">
             <li className="flex items-start">
                <span className="flex-shrink-0 mt-1 pb-1 w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('dashboard.ai_insight_1', 'Memory Accuracy improved by +5%')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.ai_insight_1_desc', 'Your word recall speed was faster yesterday.')}</p>
                </div>
             </li>
             <li className="flex items-start">
                <span className="flex-shrink-0 mt-1 pb-1 w-2 h-2 rounded-full bg-amber-500 mr-3"></span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('dashboard.ai_insight_2', 'Speech slowed slightly (-2%)')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.ai_insight_2_desc', "More pauses detected during yesterday's diary entry.")}</p>
                </div>
             </li>
             <li className="flex items-start">
                <span className="flex-shrink-0 mt-1 pb-1 w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{t('dashboard.ai_insight_3', 'Reaction time is excellent')}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('dashboard.ai_insight_3_desc', 'Remained stable at ~240ms across all visual tests.')}</p>
                </div>
             </li>
          </ul>
        </div>

        {/* Recent Tests Module */}
        <div className="bg-white dark:bg-slate-800 border text-left border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('dashboard.recent_tests')}</h2>
             <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center">
               {t('dashboard.view_all', 'View All')} <ArrowRight className="w-4 h-4 ml-1" />
             </button>
           </div>
           
           <div className="space-y-3">
             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-100 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Dual-Task Test</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                       <Clock className="w-3 h-3 mr-1" /> Today, 09:30 AM
                     </p>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-sm">92/100</span>
             </div>

             <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border border-slate-100 dark:border-slate-600">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Voice Diary</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                       <Clock className="w-3 h-3 mr-1" /> Yesterday
                     </p>
                  </div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded text-sm">88/100</span>
             </div>
             
             <button className="w-full py-3 mt-2 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
               + Add Offline Record manually
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
