import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { BarChart3, CheckCircle2, Clock, GraduationCap, Target, Zap, ArrowRight, BookOpen, Trophy } from 'lucide-react';

const HomePage: React.FC = () => {
  const { profile, isAdmin } = useAuth();

  const features = [
    { icon: CheckCircle2, title: 'Real-time Analysis', desc: 'Get instant feedback on your test performance with detailed breakdowns.', color: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { icon: BarChart3, title: 'Detailed Insights', desc: 'Subject-wise performance analytics to identify your strengths.', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { icon: Clock, title: 'Timed Tests', desc: 'Practice with real exam conditions and time-based assessments.', color: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { icon: Target, title: 'Weak Area Focus', desc: 'Identify and improve on your weakest topics with targeted practice.', color: 'from-orange-500 to-red-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 md:p-12 mb-12 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl"><GraduationCap className="w-6 h-6" /></div>
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Scorelytics Platform</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-4">
            Welcome back, <span className="text-amber-300">{profile?.name?.split(' ')[0] || 'Student'}</span>! 👋
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mb-6">Ready to continue your learning journey? Explore tests, check your analytics, and climb the leaderboard.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-0.5">
              <Zap className="w-4 h-4" /> Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            {!isAdmin && (
              <Link to="/leaderboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 backdrop-blur-sm text-white border border-white/25 rounded-xl font-bold hover:bg-white/25 transition-all">
                <Trophy className="w-4 h-4" /> Leaderboard
              </Link>
            )}
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Platform Features
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <Link to="/dashboard" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all group">
            <Zap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Take a Test</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Start a new aptitude test from the dashboard.</p>
          </Link>
          <Link to="/results" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all group">
            <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">View Analytics</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Check your performance and growth trends.</p>
          </Link>
          <Link to="/resources" className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-sm hover:shadow-md transition-all group">
            <BookOpen className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Study Resources</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Access notes, PDFs, and study materials.</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
