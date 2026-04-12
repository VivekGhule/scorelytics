import React, { useEffect, useState } from 'react';
import { QuestionRepository } from '../services/testService';
import { Question, QuestionCategory } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Search, Filter, X, Check, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import HoverZoomImage from '../components/HoverZoomImage';

const ManageQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const [formData, setFormData] = useState<Omit<Question, 'id' | 'createdAt'>>({
    text: '',
    options: ['', '', '', ''],
    optionImages: ['', '', '', ''],
    correctAnswer: '',
    category: 'Quant',
    imageUrl: ''
  });

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'optionImage', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit for Base64
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      if (field === 'imageUrl') {
        setFormData({ ...formData, imageUrl: base64 });
      } else if (field === 'optionImage' && index !== undefined) {
        const newImages = [...(formData.optionImages || ['', '', '', ''])];
        newImages[index] = base64;
        setFormData({ ...formData, optionImages: newImages });
      }
    } catch (error) {
      toast.error('Failed to process image');
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await QuestionRepository.getAll();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions', error);
    } finally {
      setLoading(false);
    }
  };

  const optionLabel = (index: number) => `Option ${String.fromCharCode(65 + index)}`;

  const getResolvedOptions = (options: string[], optionImages?: string[]) => {
    return options.map((opt, idx) => {
      const trimmed = opt.trim();
      if (trimmed) return trimmed;
      if (optionImages?.[idx]) return optionLabel(idx);
      return '';
    });
  };

  const handleAdd = async (e: React.FormEvent, stayOpen: boolean = false) => {
    e.preventDefault();

    const resolvedOptions = getResolvedOptions(formData.options, formData.optionImages);
    const hasQuestionContent = !!formData.text.trim() || !!formData.imageUrl?.trim();
    const hasInvalidOption = resolvedOptions.some(opt => !opt);

    if (!hasQuestionContent) {
      toast.error('Please provide question text or a question image');
      return;
    }

    if (hasInvalidOption) {
      toast.error('Each option needs either text or an option image');
      return;
    }

    if (!formData.correctAnswer || !resolvedOptions.includes(formData.correctAnswer)) {
      toast.error('Please select a valid correct answer');
      return;
    }

    const payload = {
      ...formData,
      text: formData.text.trim() || 'Refer to the question image.',
      options: resolvedOptions,
      imageUrl: formData.imageUrl?.trim() || ''
    };

    try {
      if (editingId) {
        await QuestionRepository.update(editingId, {
          ...payload,
          createdAt: new Date().toISOString()
        } as any);
        toast.success('Question updated');
      } else {
        await QuestionRepository.add({
          ...payload,
          createdAt: new Date().toISOString()
        });
        toast.success('Question added to bank');
      }

      const resetData = {
        text: '',
        options: ['', '', '', ''],
        optionImages: ['', '', '', ''],
        correctAnswer: '',
        category: formData.category, // Keep category for convenience
        imageUrl: ''
      };

      if (stayOpen) {
        setFormData(resetData);
      } else {
        setIsModalOpen(false);
        setFormData(resetData);
      }
      setEditingId(null);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to add question', error);
      toast.error('Failed to add question');
    }
  };

  const handleEdit = (q: Question) => {
    setEditingId(q.id || null);
    setFormData({
      text: q.text,
      options: q.options || ['', '', '', ''],
      optionImages: q.optionImages || ['', '', '', ''],
      correctAnswer: q.correctAnswer,
      category: q.category as any,
      imageUrl: q.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await QuestionRepository.delete(id);
      fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question', error);
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'All' || q.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Bank</h1>
          <p className="text-slate-500">Manage your collection of aptitude questions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          Add New Question
        </button>
      </header>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Quant', 'Reasoning', 'Verbal'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                filterCategory === cat 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading questions...</div>
        ) : filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-slate-400">
            No questions found matching your criteria.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start gap-6 group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                    {q.category}
                  </span>
                </div>
                <h3 className="text-slate-900 font-medium mb-4 leading-relaxed">{q.text}</h3>
                {q.imageUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden border border-slate-100 max-w-md">
                    <img 
                      src={q.imageUrl} 
                      alt="Question diagram" 
                      className="w-full h-auto object-contain bg-slate-50"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-4">
                  {q.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`text-sm p-3 rounded-xl flex flex-col gap-2 border ${
                        opt === q.correctAnswer 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[10px] font-bold shadow-sm border border-slate-100">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium">{opt || optionLabel(i)}</span>
                        {opt === q.correctAnswer && <Check className="w-4 h-4 ml-auto text-emerald-600" />}
                      </div>
                      {q.optionImages?.[i] && (
                        <HoverZoomImage
                          src={q.optionImages[i]}
                          alt={`Option ${String.fromCharCode(65 + i)}`}
                          className="rounded-lg overflow-hidden border border-slate-200 bg-white"
                          imgClassName="w-full h-24 object-contain p-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(q)}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title="Edit question"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => handleDelete(q.id!)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete question"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Question Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Question' : 'Add New Question'}</h2>
                <button
                  onClick={() => { setIsModalOpen(false); setEditingId(null); }}
                  className="p-2 hover:bg-slate-100 rounded-full"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              
              <form onSubmit={(e) => handleAdd(e, false)} className="flex flex-col overflow-hidden">
                <div className="p-6 space-y-6 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Question Text</label>
                    <textarea 
                      value={formData.text}
                      onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[100px]"
                      placeholder="Enter question text (optional if image is uploaded)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Question Image (Upload directly to DB)</label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, 'imageUrl')}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                          title="Upload question image"
                        />
                      </div>
                      {formData.imageUrl && (
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200">
                          <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                      <select 
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as QuestionCategory })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        title="Category"
                      >
                        <option value="Quant">Quantitative</option>
                        <option value="Reasoning">Reasoning</option>
                        <option value="Verbal">Verbal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Correct Answer</label>
                      <select 
                        required
                        value={formData.correctAnswer}
                        onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        title="Correct answer"
                      >
                        <option value="">Select correct option</option>
                        {formData.options.map((opt, i) => {
                          const resolved = opt.trim() || (formData.optionImages?.[i] ? optionLabel(i) : '');
                          if (!resolved) return null;
                          return (
                            <option key={i} value={resolved}>Option {String.fromCharCode(65 + i)}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Options & Option Images</label>
                    {formData.options.map((opt, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 font-bold shrink-0 shadow-sm">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <input 
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...formData.options];
                              newOpts[i] = e.target.value;
                              setFormData({ ...formData, options: newOpts });
                            }}
                            className="flex-1 p-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder={`Option ${String.fromCharCode(65 + i)} Text (optional if image uploaded)`}
                          />
                        </div>
                        <div className="flex items-center gap-4 pl-13">
                          <div className="flex-1 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileChange(e, 'optionImage', i)}
                              className="flex-1 p-1 bg-white border border-slate-200 rounded-xl text-[10px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                              title={`Upload image for option ${String.fromCharCode(65 + i)}`}
                            />
                          </div>
                          {formData.optionImages?.[i] && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                              <img src={formData.optionImages[i]} className="w-full h-full object-cover" alt="Preview" />
                              <button 
                                type="button"
                                onClick={() => {
                                  const newImages = [...(formData.optionImages || ['', '', '', ''])];
                                  newImages[i] = '';
                                  setFormData({ ...formData, optionImages: newImages });
                                }}
                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg"
                                title="Remove option image"
                              >
                                <X className="w-2 h-2" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-wrap gap-3 shrink-0">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => handleAdd(e as any, true)}
                    className="flex-1 px-6 py-3 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl font-bold hover:bg-indigo-100 transition-all"
                  >
                    Save & Add Another
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                  >
                    Save & Close
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

export default ManageQuestions;


