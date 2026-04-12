import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TestRepository, ResultRepository, UserRepository, QuestionRepository } from '../services/testService';
import { Test, TestResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Clock, BookOpen, PlayCircle, Trophy, Target, Star } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({
    Quant: 0,
    Reasoning: 0,
    Verbal: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testData, allResults, allQuestions] = await Promise.all([
          TestRepository.getAll(),
          ResultRepository.getAll(),
          QuestionRepository.getAll()
        ]);
        setTests(testData);

        // Calculate question counts
        const counts: Record<string, number> = { Quant: 0, Reasoning: 0, Verbal: 0 };
        allQuestions.forEach(q => {
          if (counts[q.category] !== undefined) {
            counts[q.category]++;
          }
        });
        setQuestionCounts(counts);

        // Calculate rank
        const userStats: Record<string, number> = {};
        allResults.forEach(res => {
          userStats[res.userId] = (userStats[res.userId] || 0) + res.score;
        });

        const sortedUsers = Object.entries(userStats)
          .sort(([, a], [, b]) => b - a);
        
        const rank = sortedUsers.findIndex(([uid]) => uid === profile?.uid) + 1;
        if (rank > 0) setUserRank(rank);
        if (profile) setTotalScore(userStats[profile.uid] || 0);

      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Available Tests</h1>
          <p className="text-slate-600 dark:text-slate-400">Choose a test to evaluate your skills and get detailed analysis.</p>
        </div>
        
        {userRank && (
          <Link 
            to="/leaderboard"
            className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Your Rank</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">#{userRank}</div>
            </div>
            <div className="ml-4 text-right border-l border-slate-100 dark:border-slate-800 pl-4">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Points</div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totalScore}</div>
            </div>
          </Link>
        )}
      </header>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Topic-wise Question Bank
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['Quant', 'Reasoning', 'Verbal'] as const).map(cat => (
            <Link 
              key={cat}
              to={`/question-bank/${cat}`}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer"
            >
              <div>
                <div className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{cat}</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">{questionCounts[cat]} Questions</div>
              </div>
              <div className={`p-3 rounded-xl transition-colors ${
                cat === 'Quant' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white' :
                cat === 'Reasoning' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white' :
                'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white'
              }`}>
                <Target className="w-6 h-6" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-500" />
        Featured Test Series
      </h2>

      {tests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No tests available yet</h3>
          <p className="text-slate-500 dark:text-slate-400">Check back later for new aptitude papers.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-2">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors w-fit">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider w-fit">
                    {test.category || 'Mixed'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Clock className="w-4 h-4" />
                  {test.duration} mins
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{test.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                {test.category === 'Mixed' || !test.category 
                  ? `Full length test with ${test.questionIds.length} questions across all sections.`
                  : `${test.category} specialized test with ${test.questionIds.length} targeted questions.`}
              </p>

              <Link 
                to={`/test/${test.id}`}
                className="w-full py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
              >
                <PlayCircle className="w-5 h-5" />
                Start Test
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
