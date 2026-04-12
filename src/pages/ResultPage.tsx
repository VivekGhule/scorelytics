import React, { useEffect, useState } from 'react';
import { ResultRepository } from '../services/testService';
import { TestResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { motion } from 'motion/react';
import { Trophy, Target, AlertTriangle, History, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const ResultPage: React.FC = () => {
  const { profile } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!profile) return;
      try {
        const data = await ResultRepository.getByUserId(profile.uid);
        setResults(data);
      } catch (error) {
        console.error('Failed to fetch results', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [profile]);

  if (loading) return <div className="flex justify-center py-20">Loading analytics...</div>;
  if (results.length === 0) return (
    <div className="text-center py-20">
      <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-slate-900 mb-2">No Test History</h2>
      <p className="text-slate-500">Take your first test to see detailed performance analysis.</p>
    </div>
  );

  const latest = results[0];
  
  const radarData = Object.entries(latest.subjectWise).map(([subject, score]) => ({
    subject,
    score: ((score as number) / ((latest.totalQuestions || 1) / 3)) * 100, // Assuming equal distribution for visualization
    fullMark: 100
  }));

  const historyData = results.slice(0, 5).reverse().map(r => ({
    name: format(new Date(r.timestamp), 'MMM d'),
    score: r.accuracy
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
          <p className="text-slate-500 dark:text-slate-400">Detailed breakdown of your latest test: <span className="font-bold text-slate-700 dark:text-slate-300">{latest.testTitle}</span></p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <Calendar className="w-4 h-4" />
          {format(new Date(latest.timestamp), 'PPP')}
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">{latest.score}/{latest.totalQuestions}</div>
          <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Overall Score</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <Target className="w-10 h-10" />
          </div>
          <div className="text-5xl font-black text-slate-900 dark:text-white mb-1">{Math.round(latest.accuracy)}%</div>
          <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Accuracy</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800"
        >
          <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Weak Areas
          </h3>
          <div className="space-y-3">
            {latest.weakAreas.length > 0 ? (
              latest.weakAreas.map(area => (
                <div key={area} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-900/40">
                  <span className="font-bold text-amber-900 dark:text-amber-400">{area}</span>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase">Needs Focus</span>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-slate-400 dark:text-slate-600 text-sm italic">
                No weak areas detected! Great job.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-8">Subject Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" className="dark:opacity-10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#4f46e5"
                  fill="#4f46e5"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white mb-8">Score Progression</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                  cursor={{ fill: '#f8fafc', opacity: 0.1 }}
                />
                <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 dark:text-white">Test History</h3>
          <button className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Test Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{res.testTitle}</td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{format(new Date(res.timestamp), 'MMM d, yyyy')}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">{res.score}/{res.totalQuestions}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${res.accuracy}%` }} />
                      </div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{Math.round(res.accuracy)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${res.accuracy >= 70 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'}`}>
                      {res.accuracy >= 70 ? 'Excellent' : 'Average'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
