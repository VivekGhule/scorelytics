import React, { useEffect, useMemo, useState } from 'react';
import { TestRepository, QuestionRepository } from '../services/testService';
import { Test, Question, QuestionCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Clock, BookOpen, X, Check, Search, FileText, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

type TestFormData = Omit<Test, 'id' | 'createdAt'>;

type QuestionFormData = {
  text: string;
  options: string[];
  correctAnswer: string;
  category: QuestionCategory;
  imageUrl: string;
};

const DEFAULT_TEST_FORM: TestFormData = {
  title: '',
  category: 'Mixed',
  questionIds: [],
  duration: 30
};

const DEFAULT_QUESTION_FORM: QuestionFormData = {
  text: '',
  options: ['', '', '', ''],
  correctAnswer: '',
  category: 'Quant',
  imageUrl: ''
};

const ManageTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSavingTest, setIsSavingTest] = useState(false);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [questionEditingId, setQuestionEditingId] = useState<string | null>(null);
  const [questionFormData, setQuestionFormData] = useState<QuestionFormData>(DEFAULT_QUESTION_FORM);
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const [formData, setFormData] = useState<TestFormData>(DEFAULT_TEST_FORM);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [t, q] = await Promise.all([TestRepository.getAll(), QuestionRepository.getAll()]);
      setTests(t);
      setQuestions(q);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  const resetTestForm = () => {
    setEditingId(null);
    setFormData(DEFAULT_TEST_FORM);
    setSearchTerm('');
  };

  const closeTestModal = () => {
    setIsModalOpen(false);
    resetTestForm();
  };

  const openCreateTestModal = () => {
    resetTestForm();
    setIsModalOpen(true);
  };

  const resetQuestionForm = (preferredCategory: QuestionCategory = 'Quant') => {
    setQuestionEditingId(null);
    setQuestionFormData({
      ...DEFAULT_QUESTION_FORM,
      category: preferredCategory
    });
  };

  const closeQuestionModal = () => {
    setIsQuestionModalOpen(false);
    const fallbackCategory = formData.category === 'Mixed' ? 'Quant' : (formData.category as QuestionCategory);
    resetQuestionForm(fallbackCategory);
  };

  const openCreateQuestionModal = () => {
    const category = formData.category === 'Mixed' ? 'Quant' : (formData.category as QuestionCategory);
    resetQuestionForm(category);
    setIsQuestionModalOpen(true);
  };

  const openEditQuestionModal = (question: Question) => {
    if (!question.id) return;
    const options = [...(question.options || [])];
    while (options.length < 4) options.push('');

    setQuestionEditingId(question.id);
    setQuestionFormData({
      text: question.text || '',
      options: options.slice(0, 4),
      correctAnswer: question.correctAnswer || '',
      category: question.category,
      imageUrl: question.imageUrl || ''
    });
    setIsQuestionModalOpen(true);
  };

  const handleSaveTest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const title = formData.title.trim();
    const duration = Number(formData.duration);

    if (!title) {
      toast.error('Test title is required');
      return;
    }
    if (!Number.isFinite(duration) || duration <= 0) {
      toast.error('Timer must be greater than 0 minutes');
      return;
    }
    if (formData.questionIds.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    setIsSavingTest(true);
    try {
      const payload: TestFormData = {
        ...formData,
        title,
        duration: Math.floor(duration)
      };

      if (editingId) {
        await TestRepository.update(editingId, payload);
        toast.success('Test updated successfully!');
      } else {
        await TestRepository.add({
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success('Test paper created successfully!');
      }

      closeTestModal();
      await fetchData();
    } catch (error) {
      console.error('Failed to save test', error);
      const message = (error as any)?.response?.data?.error || 'Failed to save test paper';
      toast.error(message);
    } finally {
      setIsSavingTest(false);
    }
  };

  const handleEdit = (test: Test) => {
    if (!test.id) return;
    setEditingId(test.id);
    setFormData({
      title: test.title,
      category: (test.category || 'Mixed') as any,
      questionIds: test.questionIds || [],
      duration: test.duration
    });
    setSearchTerm('');
    setIsModalOpen(true);
  };

  const handleDeleteTest = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;
    try {
      await TestRepository.delete(id);
      await fetchData();
      toast.success('Test deleted');
    } catch (error) {
      console.error('Failed to delete test', error);
      toast.error('Failed to delete test');
    }
  };

  const toggleQuestionSelection = (id: string) => {
    setFormData(prev => ({
      ...prev,
      questionIds: prev.questionIds.includes(id)
        ? prev.questionIds.filter(qid => qid !== id)
        : [...prev.questionIds, id]
    }));
  };

  const updateQuestionOption = (index: number, value: string) => {
    setQuestionFormData(prev => {
      const nextOptions = [...prev.options];
      const previousValue = nextOptions[index];
      nextOptions[index] = value;

      return {
        ...prev,
        options: nextOptions,
        correctAnswer: prev.correctAnswer === previousValue ? value : prev.correctAnswer
      };
    });
  };

  const handleSaveQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const text = questionFormData.text.trim();
    const options = questionFormData.options.map(opt => opt.trim());
    const correctAnswer = questionFormData.correctAnswer.trim();
    const imageUrl = questionFormData.imageUrl.trim();

    if (!text) {
      toast.error('Question text is required');
      return;
    }
    if (options.some(opt => !opt)) {
      toast.error('All options are required');
      return;
    }
    if (!correctAnswer || !options.includes(correctAnswer)) {
      toast.error('Select a valid correct answer');
      return;
    }

    const payload: Omit<Question, 'id' | 'createdAt'> = {
      text,
      options,
      correctAnswer,
      category: questionFormData.category,
      imageUrl: imageUrl || undefined
    };

    setIsSavingQuestion(true);
    try {
      if (questionEditingId) {
        await QuestionRepository.update(questionEditingId, payload);
        toast.success('Question updated');
      } else {
        const created = await QuestionRepository.add({
          ...payload,
          createdAt: new Date().toISOString()
        });
        if (created?.id) {
          setFormData(prev => ({
            ...prev,
            questionIds: prev.questionIds.includes(created.id)
              ? prev.questionIds
              : [...prev.questionIds, created.id]
          }));
        }
        toast.success('Question added and selected for this test');
      }

      await fetchData();
      closeQuestionModal();
    } catch (error) {
      console.error('Failed to save question', error);
      const message = (error as any)?.response?.data?.error || 'Failed to save question';
      toast.error(message);
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Delete this question from the question bank? It will be removed from all tests.')) return;

    try {
      await QuestionRepository.delete(id);
      setFormData(prev => ({
        ...prev,
        questionIds: prev.questionIds.filter(qid => qid !== id)
      }));
      await fetchData();
      if (questionEditingId === id) {
        closeQuestionModal();
      }
      toast.success('Question deleted');
    } catch (error) {
      console.error('Failed to delete question', error);
      const message = (error as any)?.response?.data?.error || 'Failed to delete question';
      toast.error(message);
    }
  };

  const filteredQuestions = useMemo(
    () =>
      questions.filter(
        q =>
          q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.category.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [questions, searchTerm]
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Test Management</h1>
          <p className="text-slate-500">Create and organize test papers for users.</p>
        </div>
        <button
          onClick={openCreateTestModal}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
        >
          <Plus className="w-5 h-5" />
          Create New Test
        </button>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-400">Loading tests...</div>
        ) : tests.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
            No tests created yet.
          </div>
        ) : (
          tests.map((test, idx) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(test)}
                    className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                    title="Edit test"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test.id!)}
                    className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete test"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{test.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                  {test.category || 'Mixed'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {test.duration} mins
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {test.questionIds.length} Questions
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeTestModal}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleSaveTest} className="flex flex-col min-h-0">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingId ? 'Edit Test Paper' : 'Create New Test Paper'}
                  </h2>
                  <button
                    type="button"
                    onClick={closeTestModal}
                    className="p-2 hover:bg-slate-100 rounded-full"
                    title="Close"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Test Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        placeholder="e.g. Advanced Quantitative Mock 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        title="Category"
                      >
                        <option value="Mixed">Mixed (All Categories)</option>
                        <option value="Quant">Quantitative</option>
                        <option value="Reasoning">Reasoning</option>
                        <option value="Verbal">Verbal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Duration (Minutes)</label>
                      <input
                        required
                        min={1}
                        step={1}
                        type="number"
                        value={formData.duration}
                        onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                        title="Duration (minutes)"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
                      <label className="text-sm font-bold text-slate-700">
                        Select Questions ({formData.questionIds.length} selected)
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={openCreateQuestionModal}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Question
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                      {filteredQuestions.length === 0 && (
                        <div className="text-sm text-slate-400 py-10 text-center border border-dashed border-slate-200 rounded-xl">
                          No questions found for this search.
                        </div>
                      )}
                      {filteredQuestions.map(q => {
                        if (!q.id) return null;
                        const isSelected = formData.questionIds.includes(q.id);

                        return (
                          <div
                            key={q.id}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              isSelected
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-slate-100 hover:border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                type="button"
                                onClick={() => toggleQuestionSelection(q.id!)}
                                className="flex-1 text-left flex items-start gap-4"
                              >
                                <div
                                  className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                                    isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-300'
                                  }`}
                                >
                                  {isSelected && <Check className="w-4 h-4" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                      {q.category}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-700 font-medium line-clamp-2">{q.text}</p>
                                </div>
                              </button>

                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditQuestionModal(q)}
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                  title="Edit question"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(q.id!)}
                                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete question"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={closeTestModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTest}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-200"
                  >
                    {isSavingTest ? 'Saving...' : editingId ? 'Save Changes' : 'Create Test Paper'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeQuestionModal}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSaveQuestion} className="flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900">
                    {questionEditingId ? 'Edit Question' : 'Add Question'}
                  </h2>
                  <button
                    type="button"
                    onClick={closeQuestionModal}
                    className="p-2 hover:bg-slate-100 rounded-full"
                    title="Close"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                    <textarea
                      required
                      value={questionFormData.text}
                      onChange={e => setQuestionFormData({ ...questionFormData, text: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[90px]"
                      placeholder="Enter question text"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select
                        value={questionFormData.category}
                        onChange={e =>
                          setQuestionFormData({
                            ...questionFormData,
                            category: e.target.value as QuestionCategory
                          })
                        }
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        title="Category"
                      >
                        <option value="Quant">Quantitative</option>
                        <option value="Reasoning">Reasoning</option>
                        <option value="Verbal">Verbal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Question Image URL (optional)</label>
                      <input
                        type="text"
                        value={questionFormData.imageUrl}
                        onChange={e => setQuestionFormData({ ...questionFormData, imageUrl: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-bold text-slate-700">Options</label>
                    {questionFormData.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <input
                          required
                          type="text"
                          value={opt}
                          onChange={e => updateQuestionOption(idx, e.target.value)}
                          className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                          placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Correct Answer</label>
                    <select
                      required
                      value={questionFormData.correctAnswer}
                      onChange={e => setQuestionFormData({ ...questionFormData, correctAnswer: e.target.value })}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      title="Correct answer"
                    >
                      <option value="">Select correct option</option>
                      {questionFormData.options.map((opt, idx) => {
                        const trimmed = opt.trim();
                        if (!trimmed) return null;
                        return (
                          <option key={`${idx}-${trimmed}`} value={trimmed}>
                            Option {String.fromCharCode(65 + idx)}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex gap-3">
                  <button
                    type="button"
                    onClick={closeQuestionModal}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingQuestion}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {isSavingQuestion ? 'Saving...' : questionEditingId ? 'Save Question' : 'Add Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageTests;
