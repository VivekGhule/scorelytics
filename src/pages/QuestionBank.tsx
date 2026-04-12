import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { QuestionRepository } from '../services/testService';
import { Question, QuestionCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Search, BookOpen, Target, ArrowRight, X, Image as ImageIcon } from 'lucide-react';
import HoverZoomImage from '../components/HoverZoomImage';

const QuestionBank: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const activeCategory = (category as QuestionCategory) || 'Quant';

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const allQuestions = await QuestionRepository.getAll();
        const filtered = allQuestions.filter(q => q.category === activeCategory);
        setQuestions(filtered);
      } catch (error) {
        console.error('Failed to fetch questions', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [activeCategory]);

  const filteredQuestions = questions.filter(q => 
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories: QuestionCategory[] = ['Quant', 'Reasoning', 'Verbal'];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Question Bank</h1>
            <p className="text-slate-500 dark:text-slate-400">Practice and review questions by topic.</p>
          </div>
        </div>

        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/question-bank/${cat}`}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" 
            placeholder={`Search ${activeCategory} questions...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
          />
        </div>
        <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm flex items-center gap-2">
          <Target className="w-4 h-4" />
          {filteredQuestions.length} Questions Found
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No questions found</h3>
            <p className="text-slate-500">Try adjusting your search or check another category.</p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedQuestion(q)}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-900 dark:text-white font-medium line-clamp-2 mb-1">{q.text}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {q.category}
                    </span>
                    {q.imageUrl && (
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-indigo-400 dark:text-indigo-500">
                        <ImageIcon className="w-3 h-3" />
                        Has Diagram
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-300 dark:text-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ml-4 shrink-0" />
            </motion.div>
          ))
        )}
      </div>

      {/* Question Details Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestion(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full uppercase tracking-wider">
                    {selectedQuestion.category}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Question Details</h2>
                </div>
                <button 
                  onClick={() => {
                    setSelectedQuestion(null);
                    setShowAnswer(false);
                  }} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Question</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{selectedQuestion.text}</p>
                  
                  {selectedQuestion.imageUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4">
                      <img 
                        src={selectedQuestion.imageUrl} 
                        alt="Question Diagram" 
                        className="max-w-full h-auto mx-auto rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Options</h3>
                  <div className="grid gap-3">
                    {selectedQuestion.options.map((opt, i) => (
                      <div 
                        key={i}
                        className={`p-4 rounded-2xl border flex flex-col gap-4 transition-all ${
                          showAnswer && opt.trim() === selectedQuestion.correctAnswer.trim()
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-200 dark:ring-emerald-800'
                          : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                            showAnswer && opt.trim() === selectedQuestion.correctAnswer.trim()
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${
                              showAnswer && opt.trim() === selectedQuestion.correctAnswer.trim() ? 'text-emerald-900 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'
                            }`}>
                              {opt}
                            </p>
                            {showAnswer && opt.trim() === selectedQuestion.correctAnswer.trim() && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">Correct Answer</span>
                            )}
                          </div>
                        </div>
                        {selectedQuestion.optionImages?.[i] && (
                          <div className="ml-14 max-w-[200px]">
                            <HoverZoomImage
                              src={selectedQuestion.optionImages[i]}
                              alt={`Option ${String.fromCharCode(65 + i)}`}
                              className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"
                              imgClassName="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {!showAnswer && (
                  <button 
                    onClick={() => setShowAnswer(true)}
                    className="w-full py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-2xl font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all border-2 border-dashed border-indigo-200 dark:border-indigo-800"
                  >
                    Click to Reveal Correct Answer
                  </button>
                )}

                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
                  <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2 uppercase tracking-wider">Instructions</h4>
                  <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1 list-disc list-inside">
                    <li>Read the question carefully before selecting an answer.</li>
                    <li>Each question has only one correct option.</li>
                    <li>This is a practice view, your selection will not be recorded.</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end shrink-0">
                <button 
                  onClick={() => {
                    setSelectedQuestion(null);
                    setShowAnswer(false);
                  }}
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionBank;

