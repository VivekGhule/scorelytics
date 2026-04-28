import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { motion } from 'motion/react';
import { Users, ClipboardList, Activity, Trophy, User as UserIcon, ArrowRight, FileText } from 'lucide-react';
import { TestResult } from '../types';

interface LeaderboardEntry {
  userId: string;
  name: string;
  photoUrl?: string;
  totalScore: number;
  testsAttempted: number;
  avgAccuracy: number;
  rank: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    questions: 0,
    tests: 0,
    users: 0,
    activeUsers: 0,
    activeWindowMinutes: 10
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [s, r] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/results'),
        ]);

        setStats({
          questions: Number(s.data?.questions ?? 0),
          tests: Number(s.data?.tests ?? 0),
          users: Number(s.data?.users ?? 0),
          activeUsers: Number(s.data?.activeUsers ?? 0),
          activeWindowMinutes: Number(s.data?.activeWindowMinutes ?? 10),
        });

        const results = Array.isArray(r.data) ? (r.data as TestResult[]) : [];
        const leaderboardMap: Record<string, Omit<LeaderboardEntry, 'rank'>> = {};

        results.forEach((result) => {
          if (!leaderboardMap[result.userId]) {
            leaderboardMap[result.userId] = {
              userId: result.userId,
              name: result.userName,
              photoUrl: result.userPhoto,
              totalScore: 0,
              testsAttempted: 0,
              avgAccuracy: 0,
            };
          }

          leaderboardMap[result.userId].totalScore += result.score;
          leaderboardMap[result.userId].testsAttempted += 1;
          leaderboardMap[result.userId].avgAccuracy += result.accuracy;
        });

        const topPerformers = Object.values(leaderboardMap)
          .map((entry) => ({
            ...entry,
            avgAccuracy: entry.testsAttempted > 0 ? entry.avgAccuracy / entry.testsAttempted : 0,
          }))
          .sort((aEntry, bEntry) => bEntry.totalScore - aEntry.totalScore || bEntry.avgAccuracy - aEntry.avgAccuracy)
          .slice(0, 5)
          .map((entry, index) => ({
            ...entry,
            rank: index + 1,
          }));

        setLeaderboard(topPerformers);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center py-20">Loading admin stats...</div>;

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.users,
      note: 'Registered accounts',
      icon: Users,
      tone: 'from-sky-500 to-blue-600',
      link: '/admin/users',
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      note: `Seen in last ${stats.activeWindowMinutes} minutes`,
      icon: Activity,
      tone: 'from-emerald-500 to-green-600',
      link: '/admin/users',
    },
    {
      title: 'Tests Created',
      value: stats.tests,
      note: 'Published test papers',
      icon: ClipboardList,
      tone: 'from-violet-500 to-indigo-600',
      link: '/admin/tests',
    },
    {
      title: 'Questions',
      value: stats.questions,
      note: 'Question bank size',
      icon: Trophy,
      tone: 'from-fuchsia-500 to-rose-500',
      link: '/admin/questions',
    },
  ];

  const settingsCards = [
    {
      title: 'User Management',
      description: 'Review accounts, activity, and profile details.',
      icon: Users,
      link: '/admin/users',
    },
    {
      title: 'Test Configuration',
      description: 'Create, update, and organize test series.',
      icon: ClipboardList,
      link: '/admin/tests',
    },
    {
      title: 'Questions Configuration',
      description: 'Manage the question bank, categories, and difficulty levels.',
      icon: FileText,
      link: '/admin/questions',
    },
    {
      title: 'Resources Configuration',
      description: 'Create, update, and organize notes and PDFs.',
      icon: FileText,
      link: '/resources',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 px-8 py-10 text-white shadow-xl shadow-slate-200 dark:border-slate-800 dark:shadow-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.35),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.2),_transparent_30%)]" />
        <div className="relative z-10 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-300">
            Admin Dashboard
          </div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Operational overview for users, tests, questions, and performance.</h1>
          <p className="mt-3 text-sm text-slate-300 sm:text-base">
            Track platform activity, manage core content, and monitor top-performing learners.
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Key Stats</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Core platform numbers for users, tests, and questions.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {statsCards.map((card, idx) => (
            <Link key={card.title} to={card.link} className="group block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all group-hover:-translate-y-1 group-hover:border-slate-300 group-hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-slate-700"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                    <card.icon className="h-6 w-6" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-400" />
                </div>
                <div className="text-sm font-bold uppercase tracking-widest text-slate-400">{card.title}</div>
                <div className="mt-2 text-4xl font-black tracking-tight text-slate-900 dark:text-white">{card.value}</div>
                <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">{card.note}</div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Top performers ranked by total score and accuracy.</p>
            </div>
            <Link to="/leaderboard" className="text-sm font-bold text-indigo-600 transition-colors hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300">
              View full board
            </Link>
          </div>

          {leaderboard.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
              No learner attempts yet, so the leaderboard will appear once users complete tests.
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.userId}
                  className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-black ${
                    entry.rank === 1
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      : entry.rank === 2
                        ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : entry.rank === 3
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {entry.rank}
                  </div>

                  {entry.photoUrl ? (
                    <img
                      src={entry.photoUrl}
                      alt={entry.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm dark:bg-slate-800 dark:text-slate-500">
                      <UserIcon className="h-5 w-5" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bold text-slate-900 dark:text-white">{entry.name}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {entry.testsAttempted} attempts - {entry.avgAccuracy.toFixed(1)}% avg accuracy
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900 dark:text-white">{entry.totalScore}</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Points</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Important Settings</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Shortcuts to the controls admins use most often.</p>
          </div>

          <div className="space-y-4">
            {settingsCards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="group flex items-start gap-4 rounded-2xl border border-slate-200 px-5 py-4 transition-all hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-800 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-indigo-500/20 dark:group-hover:text-indigo-300">
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white">{card.title}</div>
                  <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">{card.description}</div>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600 dark:text-slate-600 dark:group-hover:text-indigo-300" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
