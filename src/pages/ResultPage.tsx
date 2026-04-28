import React, { useEffect, useState } from 'react';
import { ResultRepository, UserRepository } from '../services/testService';
import { TestResult, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { Users, Activity, Target, History, Calendar, BarChart3, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

type AdminUserSummary = {
  uid: string;
  role: UserRole;
  isActive?: boolean;
};

const ResultPage: React.FC = () => {
  const { profile, isAdmin } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [learnerStats, setLearnerStats] = useState({
    totalLearners: 0,
    activeLearners: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        if (isAdmin) {
          const [allUsers, allResults] = await Promise.all([
            UserRepository.getAll(),
            ResultRepository.getAll(),
          ]);

          const learners = (allUsers as AdminUserSummary[]).filter((user) => user.role === 'USER');
          const sortedResults = [...(allResults as TestResult[])].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );

          setLearnerStats({
            totalLearners: learners.length,
            activeLearners: learners.filter((user) => user.isActive).length,
          });
          setResults(sortedResults);
        } else {
          const data = await ResultRepository.getByUserId(profile.uid);
          const sortedResults = [...(data as TestResult[])].sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
          setLearnerStats({
            totalLearners: 0,
            activeLearners: 0,
          });
          setResults(sortedResults);
        }
      } catch (error) {
        console.error('Failed to fetch results', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [profile, isAdmin]);

  if (loading) return <div className="flex justify-center py-20">Loading analytics...</div>;

  const totalTests = results.length;
  const totalCorrectAnswers = results.reduce((sum, result) => sum + result.score, 0);
  const averageScore = totalTests > 0 ? totalCorrectAnswers / totalTests : 0;
  const totalQuestionsAnswered = results.reduce((sum, result) => sum + result.totalQuestions, 0);
  const averageAccuracy = totalQuestionsAnswered > 0
    ? (totalCorrectAnswers * 100) / totalQuestionsAnswered
    : 0;
  const usersWithAttempts = isAdmin ? new Set(results.map((result) => result.userId)).size : 0;
  const averageAttemptsPerLearner = usersWithAttempts > 0 ? totalTests / usersWithAttempts : 0;
  const latestTimestamp = results[0]?.timestamp;

  const statsCards = isAdmin
    ? [
        {
          title: 'Learner Accounts',
          value: learnerStats.totalLearners.toString(),
          description: 'Registered users with learner access.',
          icon: Users,
          tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
        },
        {
          title: 'Active Learners',
          value: learnerStats.activeLearners.toString(),
          description: 'Learners seen in the recent activity window.',
          icon: Activity,
          tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        },
        {
          title: 'Users With Attempts',
          value: usersWithAttempts.toString(),
          description: 'Learners who have completed at least one test.',
          icon: History,
          tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        },
        {
          title: 'Avg Attempts / Learner',
          value: averageAttemptsPerLearner.toFixed(1),
          description: 'Average completed tests among active learners.',
          icon: BarChart3,
          tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        },
      ]
    : [
        {
          title: 'Total Tests',
          value: totalTests.toString(),
          description: 'Completed test attempts in your history.',
          icon: BarChart3,
          tone: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
        },
        {
          title: 'Average Score',
          value: averageScore.toFixed(1),
          description: 'Average correct answers across your attempts.',
          icon: CheckCircle2,
          tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        },
        {
          title: 'Accuracy',
          value: `${averageAccuracy.toFixed(1)}%`,
          description: 'Overall accuracy based on answered questions.',
          icon: Target,
          tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        },
      ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {isAdmin ? 'User Analytics' : 'Your Analytics'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isAdmin
              ? 'Simple user stats and recent learner activity from completed attempts.'
              : 'Simple stats from your completed tests, without the extra analytics clutter.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
          <Calendar className="w-4 h-4" />
          {latestTimestamp ? format(new Date(latestTimestamp), 'PPP') : 'No attempts yet'}
        </div>
      </header>

      <div className={`grid gap-6 ${isAdmin ? 'md:grid-cols-2 xl:grid-cols-4' : 'md:grid-cols-3'}`}>
        {statsCards.map((card) => (
          <div
            key={card.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${card.tone}`}>
              <card.icon className="h-6 w-6" />
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400">{card.title}</div>
            <div className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white">{card.value}</div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-slate-900 dark:text-white">
            {isAdmin ? 'Recent Learner Attempts' : 'Test History'}
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin
              ? 'A simple view of recent learner activity across the platform.'
              : 'Your latest completed attempts and scores.'}
          </p>
        </div>
        {results.length === 0 ? (
          <div className="py-16 text-center">
            <History className="mx-auto mb-4 h-12 w-12 text-slate-200 dark:text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isAdmin ? 'No Learner Activity Yet' : 'No Test History Yet'}
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {isAdmin
                ? 'User stats will appear here once learners start submitting tests.'
                : 'Take your first test to see your simple analytics summary.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  {isAdmin && <th className="px-6 py-4">Learner</th>}
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Score</th>
                  <th className="px-6 py-4">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {results.slice(0, isAdmin ? 8 : results.length).map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {isAdmin && (
                      <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{result.userName}</td>
                    )}
                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{result.testTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {format(new Date(result.timestamp), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                      {result.score}/{result.totalQuestions}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600 dark:text-slate-400">
                      {result.accuracy.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
