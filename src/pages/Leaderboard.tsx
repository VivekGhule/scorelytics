import React, { useEffect, useState } from 'react';
import { ResultRepository, UserRepository } from '../services/testService';
import { TestResult, UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Trophy, Medal, Target, Award, User as UserIcon, TrendingUp } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  name: string;
  photoUrl?: string;
  totalScore: number;
  testsAttempted: number;
  avgAccuracy: number;
  rank: number;
}

const Leaderboard: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const allResults = await ResultRepository.getAll();

        const userStats: Record<string, { 
          name: string, 
          photoUrl?: string, 
          totalScore: number, 
          totalAccuracy: number, 
          count: number 
        }> = {};

        allResults.forEach(res => {
          if (!userStats[res.userId]) {
            userStats[res.userId] = { 
              name: res.userName, 
              photoUrl: res.userPhoto, 
              totalScore: 0, 
              totalAccuracy: 0, 
              count: 0 
            };
          }
          userStats[res.userId].totalScore += res.score;
          userStats[res.userId].totalAccuracy += res.accuracy;
          userStats[res.userId].count += 1;
        });

        const leaderboard: LeaderboardEntry[] = Object.entries(userStats).map(([uid, stats]) => {
          return {
            userId: uid,
            name: stats.name,
            photoUrl: stats.photoUrl,
            totalScore: stats.totalScore,
            testsAttempted: stats.count,
            avgAccuracy: stats.count > 0 ? stats.totalAccuracy / stats.count : 0,
            rank: 0
          };
        })
        .sort((a, b) => b.totalScore - a.totalScore || b.avgAccuracy - a.avgAccuracy)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));

        setEntries(leaderboard);
        
        if (currentUser) {
          const current = leaderboard.find(e => e.userId === currentUser.uid);
          if (current) setUserRank(current);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentUser]);

  if (loading) return <div className="flex justify-center py-20">Loading leaderboard...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="inline-flex p-4 bg-amber-100 dark:bg-amber-900/20 rounded-full text-amber-600 dark:text-amber-400 mb-2">
          <Trophy className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Global Leaderboard</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          See how you stack up against other candidates. Rankings are based on total points earned across all tests.
        </p>
      </header>

      {userRank && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold border border-white/30">
              #{userRank.rank}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your Current Standing</h2>
              <p className="text-indigo-100">Keep practicing to climb higher!</p>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{userRank.totalScore}</div>
              <div className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Total Points</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{userRank.avgAccuracy.toFixed(1)}%</div>
              <div className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Avg Accuracy</div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Tests</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Accuracy</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {entries.map((entry, idx) => (
                <motion.tr 
                  key={entry.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${entry.userId === currentUser?.uid ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {entry.rank === 1 && <Medal className="w-5 h-5 text-amber-500" />}
                      {entry.rank === 2 && <Medal className="w-5 h-5 text-slate-400" />}
                      {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-700" />}
                      <span className={`font-bold ${entry.rank <= 3 ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-600'}`}>
                        {entry.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {entry.photoUrl ? (
                        <img src={entry.photoUrl} alt={entry.name} className="w-10 h-10 rounded-xl object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-600">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{entry.name}</div>
                        {entry.userId === currentUser?.uid && (
                          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded font-bold uppercase">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                    {entry.testsAttempted}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-slate-900 dark:text-white font-bold">{entry.avgAccuracy.toFixed(1)}%</span>
                      <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${entry.avgAccuracy}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg font-bold">
                      <Award className="w-4 h-4" />
                      {entry.totalScore}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
