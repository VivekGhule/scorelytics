import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TestRepository, QuestionRepository, TestService } from '../services/testService';
import { Test, Question } from '../types';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import HoverZoomImage from '../components/HoverZoomImage';
import { getProfileAvatarUrl } from '../utils/avatar';

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!test || !profile || submitting) return;
    setSubmitting(true);
    try {
      await TestService.calculateResult(
        profile.uid,
        profile.name,
        getProfileAvatarUrl(profile),
        test,
        answers,
        questions
      );
      navigate('/results');
    } catch (error) {
      console.error('Submission failed', error);
      setSubmitting(false);
    }
  }, [test, profile, answers, questions, navigate, submitting]);

  useEffect(() => {
    const fetchData = async () => {
      if (!testId) return;
      try {
        const testData = await TestRepository.getById(testId);
        if (!testData) {
          navigate('/dashboard');
          return;
        }
        setTest(testData);
        setTimeLeft(testData.duration * 60);

        const testQuestions = await QuestionRepository.getByIds(testData.questionIds);
        setQuestions(testQuestions);
      } catch (error) {
        console.error('Failed to load test', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [testId, navigate]);

  useEffect(() => {
    if (timeLeft <= 0 && !loading && test) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, test, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="flex justify-center py-20">Loading test...</div>;
  if (!test || questions.length === 0) return <div className="text-center py-20">No questions found for this test.</div>;

  const currentQuestion = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 sticky top-20 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur py-4 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{test.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Question {currentIdx + 1} of {questions.length}</p>
        </div>
        
        <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-mono text-xl font-bold shadow-sm ${timeLeft < 60 ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 animate-pulse' : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'}`}>
          <Clock className="w-6 h-6" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-8">
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                  {currentQuestion.category}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-8 leading-relaxed">
                {currentQuestion.text}
              </h2>

              {currentQuestion.imageUrl && (
                <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 max-w-full">
                  <img 
                    src={currentQuestion.imageUrl} 
                    alt="Question diagram" 
                    className="w-full h-auto object-contain bg-slate-50 dark:bg-slate-800 max-h-[400px]"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id!]: option }))}
                    className={`w-full p-4 rounded-xl text-left border-2 transition-all flex flex-col gap-3 ${
                      answers[currentQuestion.id!] === option 
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 font-bold' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        answers[currentQuestion.id!] === option ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </div>
                    {currentQuestion.optionImages?.[idx] && (
                      <div className="ml-12 max-w-[200px]">
                        <HoverZoomImage
                          src={currentQuestion.optionImages[idx]}
                          alt={`Option ${String.fromCharCode(65 + idx)}`}
                          className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-2"
                          imgClassName="w-full h-auto object-contain"
                        />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center">
            <button
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            
            {currentIdx === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Finish Test'}
                <Send className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-slate-900 dark:bg-indigo-600 text-white hover:bg-slate-800 dark:hover:bg-indigo-700 transition-colors"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Question Palette
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-full aspect-square rounded-lg text-xs font-bold transition-all ${
                    currentIdx === idx 
                    ? 'ring-2 ring-indigo-600 dark:ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' 
                    : ''
                  } ${
                    answers[q.id!] 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-800">
            <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2 uppercase tracking-wider">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-indigo-700 dark:text-indigo-400">Attempted</span>
                <span className="font-bold text-indigo-900 dark:text-indigo-200">{Object.keys(answers).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-700 dark:text-indigo-400">Remaining</span>
                <span className="font-bold text-indigo-900 dark:text-indigo-200">{questions.length - Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
