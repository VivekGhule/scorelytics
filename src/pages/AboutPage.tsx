import React from 'react';
import { motion } from 'motion/react';
import { GraduationCap, Target, Users, Award, BookOpen, Zap, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    { icon: Target, title: 'Precision', desc: 'Every question and analysis is crafted with accuracy to deliver meaningful results.', color: 'bg-blue-50 dark:bg-blue-900/20', iconColor: 'text-blue-600 dark:text-blue-400' },
    { icon: Zap, title: 'Innovation', desc: 'We leverage cutting-edge technology to make learning smarter and more effective.', color: 'bg-amber-50 dark:bg-amber-900/20', iconColor: 'text-amber-600 dark:text-amber-400' },
    { icon: Users, title: 'Community', desc: 'Join thousands of learners competing, growing, and achieving together.', color: 'bg-emerald-50 dark:bg-emerald-900/20', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    { icon: Shield, title: 'Trust', desc: 'Your data is secure and your progress is accurately tracked at every step.', color: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600 dark:text-purple-400' },
  ];

  const stats = [
    { value: '10K+', label: 'Students' },
    { value: '500+', label: 'Questions' },
    { value: '50+', label: 'Test Series' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/25 mb-6">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">About <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">Scorelytics</span></h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Scorelytics is an advanced aptitude assessment platform designed to help students master competitive exams through precision analytics, timed practice, and personalized feedback.</p>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
        {stats.map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 text-center shadow-sm">
            <div className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 mb-1">{s.value}</div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Mission */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-8 md:p-12 mb-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-6 h-6 text-amber-300" />
            <span className="text-sm font-bold uppercase tracking-wider text-white/80">Our Mission</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">Empowering Students to Excel</h2>
          <p className="text-white/80 text-lg max-w-3xl">We believe every student deserves access to high-quality practice tests and insightful analytics. Scorelytics bridges the gap between preparation and performance by providing real-time feedback, subject-wise breakdowns, and adaptive learning paths.</p>
        </div>
      </motion.div>

      {/* Values */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 text-center flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Our Values
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
              <div className={`w-12 h-12 ${v.color} rounded-xl flex items-center justify-center mb-4`}>
                <v.icon className={`w-6 h-6 ${v.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{v.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
