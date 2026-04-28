import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { GraduationCap, CheckCircle2, BarChart3, Clock, ArrowRight, Target, Zap, Users, Star, BookOpen, Shield } from 'lucide-react';

const LandingPage: React.FC = () => {
  const { profile, loading } = useAuth();

  if (!loading && profile) {
    return <Navigate to="/dashboard" replace />;
  }

  const features = [
    { icon: CheckCircle2, title: 'Real-time Analysis', desc: 'Get instant feedback on every test with detailed performance metrics.', color: 'bg-green-100 dark:bg-green-900/20', iconColor: 'text-green-600 dark:text-green-400' },
    { icon: BarChart3, title: 'Detailed Insights', desc: 'Subject-wise breakdown helps you understand your strengths and weaknesses.', color: 'bg-blue-100 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
    { icon: Clock, title: 'Timed Tests', desc: 'Practice under real exam conditions with precise time tracking.', color: 'bg-purple-100 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
    { icon: GraduationCap, title: 'Expert Content', desc: 'Questions curated by experts covering Quant, Reasoning & Verbal.', color: 'bg-orange-100 dark:bg-orange-900/20', iconColor: 'text-orange-600 dark:text-orange-400' },
    { icon: Target, title: 'Weak Area Focus', desc: 'Identify weak topics and get targeted practice recommendations.', color: 'bg-red-100 dark:bg-red-900/20', iconColor: 'text-red-600 dark:text-red-400' },
    { icon: Shield, title: 'Secure & Reliable', desc: 'Your progress is safely tracked with enterprise-grade security.', color: 'bg-teal-100 dark:bg-teal-900/20', iconColor: 'text-teal-600 dark:text-teal-400' },
  ];

  const stats = [
    { value: '10K+', label: 'Active Students' },
    { value: '500+', label: 'Practice Questions' },
    { value: '50+', label: 'Test Series' },
    { value: '98%', label: 'Satisfaction Rate' },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-full text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-6">
              <Zap className="w-3.5 h-3.5" /> #1 Aptitude Prep Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
              Master Your{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                Aptitude
              </span>{' '}
              Skills with Precision
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Scorelytics provides advanced performance analytics, subject-wise breakdown, and personalized feedback to help you excel in competitive exams.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-bold text-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </motion.div>

          {/* Right side — Decorative card */}
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur-2xl opacity-20 dark:opacity-30 -rotate-3" />
              <div className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Scorelytics</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Performance Dashboard</div>
                  </div>
                </div>
                <div className="space-y-3 mb-6">
                  {['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability'].map((subject, i) => (
                    <div key={subject} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{subject}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${i === 0 ? 'bg-indigo-500 w-[85%]' : i === 1 ? 'bg-violet-500 w-[72%]' : 'bg-emerald-500 w-[90%]'}`} style={{ width: i === 0 ? '85%' : i === 1 ? '72%' : '90%' }} />
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{i === 0 ? '85%' : i === 1 ? '72%' : '90%'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span>Overall Score: <strong className="text-slate-900 dark:text-white">82%</strong></span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-1">{s.value}</div>
              <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Why Students Love <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Scorelytics</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Everything you need to prepare, practice, and perform at your best.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
              <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="py-16">
        <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-5 h-5 text-amber-300" />
              <span className="text-sm font-bold uppercase tracking-wider text-white/80">Join 10,000+ students</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">Create your free account today and unlock your full potential with Scorelytics.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all transform hover:-translate-y-0.5">
                <BookOpen className="w-5 h-5" /> Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default LandingPage;
