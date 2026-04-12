import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { motion } from 'motion/react';
import { Users, FileText, ClipboardList, Activity, Plus, ArrowRight } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    questions: 0,
    tests: 0,
    results: 0,
    users: 0,
    activeUsers: 0,
    activeWindowMinutes: 10,
    dbUp: false,
    dbPingMs: -1
  });
  const [analytics, setAnalytics] = useState<{
    days: number;
    submissionsByDay: Array<{ day: string; submissions: number; avgAccuracy: number; avgScore: number }>;
    topWeakAreas: Array<{ weakArea: string; count: number }>;
    topTests: Array<{ testTitle: string; submissions: number }>;
  }>({ days: 7, submissionsByDay: [], topWeakAreas: [], topTests: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, a] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/analytics?days=7'),
        ]);
        setStats(s.data);
        setAnalytics({
          days: a.data?.days ?? 7,
          submissionsByDay: Array.isArray(a.data?.submissionsByDay) ? a.data.submissionsByDay : [],
          topWeakAreas: Array.isArray(a.data?.topWeakAreas) ? a.data.topWeakAreas : [],
          topTests: Array.isArray(a.data?.topTests) ? a.data.topTests : [],
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-20">Loading admin stats...</div>;

  const cards = [
    { title: 'Total Questions', value: stats.questions, icon: FileText, color: 'bg-blue-500', link: '/admin/questions' },
    { title: 'Active Tests', value: stats.tests, icon: ClipboardList, color: 'bg-purple-500', link: '/admin/tests' },
    { title: `Active Users (last ${stats.activeWindowMinutes}m)`, value: stats.activeUsers, icon: Activity, color: 'bg-emerald-500', link: '/admin/users' },
    { title: 'Total Users', value: stats.users || '...', icon: Users, color: 'bg-orange-500', link: '/admin/users' }
  ];

  const activePct = stats.users > 0 ? Math.min(100, Math.round((stats.activeUsers / stats.users) * 100)) : 0;
  const dbPct = stats.dbUp ? 100 : 10;
  const barClass = (pct: number) => {
    if (pct >= 100) return 'w-full';
    if (pct >= 90) return 'w-[90%]';
    if (pct >= 80) return 'w-[80%]';
    if (pct >= 70) return 'w-[70%]';
    if (pct >= 60) return 'w-[60%]';
    if (pct >= 50) return 'w-[50%]';
    if (pct >= 40) return 'w-[40%]';
    if (pct >= 30) return 'w-[30%]';
    if (pct >= 20) return 'w-[20%]';
    if (pct >= 10) return 'w-[10%]';
    return 'w-[2%]';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Center</h1>
          <p className="text-slate-500">Manage your question bank, test papers, and monitor user performance.</p>
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className={`w-12 h-12 ${card.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-slate-200`}>
              <card.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-black text-slate-900 mb-1">{card.value}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{card.title}</div>
            <Link to={card.link} className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Manage <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold text-slate-900">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/admin/questions" 
              className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 group-hover:text-indigo-600 mb-4 shadow-sm">
                <Plus className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900">Add Question</div>
              <div className="text-xs text-slate-500">Expand your question bank</div>
            </Link>
            <Link 
              to="/admin/tests" 
              className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-all group"
            >
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-600 group-hover:text-purple-600 mb-4 shadow-sm">
                <Plus className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900">Create Test</div>
              <div className="text-xs text-slate-500">Design a new test paper</div>
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-4">System Health</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Database</span>
                  <span className="font-bold">
                    {stats.dbUp ? `UP (${stats.dbPingMs}ms)` : 'DOWN'}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-indigo-500 ${barClass(dbPct)}`} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Active Users (last {stats.activeWindowMinutes}m)</span>
                  <span className="font-bold">{stats.activeUsers} Users</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full bg-emerald-500 ${barClass(activePct)}`} />
                </div>
              </div>
              {stats.dbUp ? (
                <div className="pt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  All systems operational
                </div>
              ) : (
                <div className="pt-4 flex items-center gap-2 text-red-300 text-sm font-bold">
                  <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse" />
                  Database connection issue
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Analytics (last {analytics.days} days)</h3>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Insights
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="h-72">
            <div className="text-sm font-bold text-slate-700 mb-3">Submissions per day</div>
            {analytics.submissionsByDay.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No submission data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.submissionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="submissions" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="h-72">
            <div className="text-sm font-bold text-slate-700 mb-3">Average accuracy (%)</div>
            {analytics.submissionsByDay.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">No accuracy data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.submissionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="avgAccuracy" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="text-sm font-bold text-slate-700 mb-3">Top weak areas</div>
            {analytics.topWeakAreas.length === 0 ? (
              <div className="text-slate-400">No weak-area data yet.</div>
            ) : (
              <ul className="space-y-2">
                {analytics.topWeakAreas.slice(0, 6).map((w) => (
                  <li key={w.weakArea} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <span className="font-semibold text-slate-800">{w.weakArea}</span>
                    <span className="text-sm font-bold text-slate-500">{w.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="text-sm font-bold text-slate-700 mb-3">Most attempted tests</div>
            {analytics.topTests.length === 0 ? (
              <div className="text-slate-400">No test-attempt data yet.</div>
            ) : (
              <ul className="space-y-2">
                {analytics.topTests.slice(0, 6).map((t) => (
                  <li key={t.testTitle} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <span className="font-semibold text-slate-800 truncate pr-3">{t.testTitle}</span>
                    <span className="text-sm font-bold text-slate-500">{t.submissions}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
