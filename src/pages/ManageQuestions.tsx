import React, { useEffect, useMemo, useRef, useState } from 'react';
import { QuestionRepository } from '../services/testService';
import { Question, QuestionCategory, QuestionDifficulty } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Edit2, Search, X, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { toast } from 'sonner';

type QuestionFormData = Omit<Question, 'id' | 'createdAt'>;

const DEFAULT_FORM_DATA: QuestionFormData = {
  text: '',
  options: ['', '', '', ''],
  optionImages: ['', '', '', ''],
  correctAnswer: '',
  category: 'Quant',
  difficulty: 'Easy',
  imageUrl: ''
};

const CATEGORY_FILTERS = ['All', 'Quant', 'Reasoning', 'Verbal'] as const;
const DIFFICULTY_FILTERS = ['All', 'Easy', 'Medium', 'Hard'] as const;

const ManageQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('All');
  const [filterDifficulty, setFilterDifficulty] = useState<(typeof DIFFICULTY_FILTERS)[number]>('All');
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [formData, setFormData] = useState<QuestionFormData>(DEFAULT_FORM_DATA);
  const bulkUploadInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await QuestionRepository.getAll();
      setQuestions(data);
    } catch (error) {
      console.error('Failed to fetch questions', error);
      toast.error('Unable to load questions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = (overrides?: Partial<QuestionFormData>) => {
    setFormData({
      ...DEFAULT_FORM_DATA,
      category: formData.category,
      difficulty: formData.difficulty,
      ...overrides,
    });
  };

  const optionLabel = (index: number) => `Option ${String.fromCharCode(65 + index)}`;

  const getResolvedOptions = (options: string[], optionImages?: string[]) =>
    options.map((option, index) => {
      const trimmed = option.trim();
      if (trimmed) return trimmed;
      if (optionImages?.[index]) return optionLabel(index);
      return '';
    });

  const getDifficultyBadgeClasses = (difficulty: QuestionDifficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'Medium':
        return 'border-amber-200 bg-amber-50 text-amber-700';
      case 'Hard':
        return 'border-rose-200 bg-rose-50 text-rose-700';
      default:
        return 'border-slate-200 bg-slate-50 text-slate-600';
    }
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'imageUrl' | 'optionImage',
    index?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);
      if (field === 'imageUrl') {
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      } else if (field === 'optionImage' && index !== undefined) {
        setFormData(prev => {
          const nextImages = [...(prev.optionImages || ['', '', '', ''])];
          nextImages[index] = base64;
          return { ...prev, optionImages: nextImages };
        });
      }
    } catch (error) {
      toast.error('Failed to process image');
    } finally {
      e.target.value = '';
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id || null);
    setFormData({
      text: question.text,
      options: question.options || ['', '', '', ''],
      optionImages: question.optionImages || ['', '', '', ''],
      correctAnswer: question.correctAnswer,
      category: question.category,
      difficulty: question.difficulty || 'Easy',
      imageUrl: question.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await QuestionRepository.delete(id);
      toast.success('Question deleted');
      await fetchQuestions();
    } catch (error) {
      console.error('Failed to delete question', error);
      toast.error('Failed to delete question');
    }
  };

  const handleSave = async (e: React.FormEvent, stayOpen = false) => {
    e.preventDefault();

    const resolvedOptions = getResolvedOptions(formData.options, formData.optionImages);
    const hasQuestionContent = !!formData.text.trim() || !!formData.imageUrl?.trim();
    const hasInvalidOption = resolvedOptions.some(option => !option);

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

    const payload: Omit<Question, 'id'> = {
      ...formData,
      text: formData.text.trim() || 'Refer to the question image.',
      options: resolvedOptions,
      difficulty: formData.difficulty,
      imageUrl: formData.imageUrl?.trim() || '',
      createdAt: new Date().toISOString()
    };

    try {
      if (editingId) {
        await QuestionRepository.update(editingId, payload);
        toast.success('Question updated');
      } else {
        await QuestionRepository.add(payload);
        toast.success('Question added');
      }

      const nextFormState: Partial<QuestionFormData> = {
        text: '',
        options: ['', '', '', ''],
        optionImages: ['', '', '', ''],
        correctAnswer: '',
        imageUrl: ''
      };

      if (stayOpen) {
        resetForm(nextFormState);
      } else {
        setIsModalOpen(false);
        setEditingId(null);
        resetForm(nextFormState);
      }

      await fetchQuestions();
    } catch (error) {
      console.error('Failed to save question', error);
      toast.error(editingId ? 'Failed to update question' : 'Failed to add question');
    }
  };

  const parseCsvLine = (line: string) => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];

      if (char === '"') {
        if (inQuotes && line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  };

  const normalizeCsvCategory = (raw: string): QuestionCategory | null => {
    switch (raw.trim().toLowerCase()) {
      case 'quant':
        return 'Quant';
      case 'reasoning':
        return 'Reasoning';
      case 'verbal':
        return 'Verbal';
      default:
        return null;
    }
  };

  const normalizeCsvDifficulty = (raw: string): QuestionDifficulty | null => {
    switch (raw.trim().toLowerCase()) {
      case 'easy':
        return 'Easy';
      case 'medium':
        return 'Medium';
      case 'hard':
        return 'Hard';
      default:
        return null;
    }
  };

  const resolveCsvCorrectAnswer = (rawAnswer: string, options: string[]) => {
    const normalized = rawAnswer.trim();
    const optionIndex = ['a', 'b', 'c', 'd'].indexOf(normalized.toLowerCase());
    if (optionIndex >= 0) {
      return options[optionIndex];
    }

    return options.find(option => option === normalized) || null;
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBulkUploading(true);
    try {
      const content = await file.text();
      const rows = content
        .split(/\r?\n/)
        .map(row => row.trim())
        .filter(Boolean);

      if (rows.length < 2) {
        toast.error('CSV file must include a header row and at least one question');
        return;
      }

      const headers = parseCsvLine(rows[0]).map(header => header.toLowerCase());
      const requiredHeaders = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer', 'category', 'difficulty'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

      if (missingHeaders.length > 0) {
        toast.error(`Missing CSV columns: ${missingHeaders.join(', ')}`);
        return;
      }

      const uploads: Array<Omit<Question, 'id'>> = [];

      for (let index = 1; index < rows.length; index += 1) {
        const values = parseCsvLine(rows[index]);
        const rowData = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
          acc[header] = values[headerIndex] || '';
          return acc;
        }, {});

        const options = [rowData.optiona, rowData.optionb, rowData.optionc, rowData.optiond].map(value => value.trim());
        const category = normalizeCsvCategory(rowData.category || '');
        const difficulty = normalizeCsvDifficulty(rowData.difficulty || '');
        const correctAnswer = resolveCsvCorrectAnswer(rowData.correctanswer || '', options);

        if (!rowData.question?.trim()) {
          throw new Error(`Row ${index + 1}: question is required`);
        }
        if (options.some(option => !option)) {
          throw new Error(`Row ${index + 1}: all four options are required`);
        }
        if (!category) {
          throw new Error(`Row ${index + 1}: invalid category`);
        }
        if (!difficulty) {
          throw new Error(`Row ${index + 1}: invalid difficulty`);
        }
        if (!correctAnswer) {
          throw new Error(`Row ${index + 1}: correctAnswer must match A/B/C/D or an option value`);
        }

        uploads.push({
          text: rowData.question.trim(),
          options,
          optionImages: ['', '', '', ''],
          correctAnswer,
          category,
          difficulty,
          imageUrl: '',
          createdAt: new Date().toISOString()
        });
      }

      let successCount = 0;
      let failureCount = 0;

      for (const upload of uploads) {
        const created = await QuestionRepository.add(upload);
        if (created) {
          successCount += 1;
        } else {
          failureCount += 1;
        }
      }

      if (successCount > 0) {
        toast.success(
          failureCount > 0
            ? `${successCount} questions uploaded, ${failureCount} failed`
            : `${successCount} questions uploaded successfully`
        );
      } else {
        toast.error('No questions were uploaded');
      }

      await fetchQuestions();
    } catch (error) {
      console.error('Bulk upload failed', error);
      toast.error((error as Error).message || 'Failed to upload CSV');
    } finally {
      setIsBulkUploading(false);
      e.target.value = '';
    }
  };

  const filteredQuestions = useMemo(
    () =>
      questions.filter(question => {
        const difficulty = question.difficulty || 'Easy';
        const haystack = `${question.text} ${question.category} ${difficulty} ${question.correctAnswer}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || question.category === filterCategory;
        const matchesDifficulty = filterDifficulty === 'All' || difficulty === filterDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
      }),
    [questions, searchTerm, filterCategory, filterDifficulty]
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Question Management</h1>
          <p className="text-slate-500">Manage question content, difficulty levels, and bulk imports from one place.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={bulkUploadInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleBulkUpload}
          />
          <button
            type="button"
            onClick={() => bulkUploadInputRef.current?.click()}
            disabled={isBulkUploading}
            className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold hover:bg-slate-50 transition-all disabled:opacity-60"
          >
            <span className="inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {isBulkUploading ? 'Uploading CSV...' : 'Bulk Upload CSV'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </button>
        </div>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1.5fr_0.7fr_0.7fr]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by question, category, difficulty, or answer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value as (typeof CATEGORY_FILTERS)[number])}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Filter by category"
          >
            {CATEGORY_FILTERS.map(option => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Categories' : option}
              </option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value as (typeof DIFFICULTY_FILTERS)[number])}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Filter by difficulty"
          >
            {DIFFICULTY_FILTERS.map(option => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Difficulties' : option}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 text-xs text-slate-500">
          CSV format: <span className="font-mono">question,optionA,optionB,optionC,optionD,correctAnswer,category,difficulty</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Question</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-400">Difficulty</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Loading questions...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    No questions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((question, index) => (
                  <motion.tr
                    key={question.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/80"
                  >
                    <td className="px-6 py-5 align-top">
                      <div className="max-w-3xl">
                        <div className="font-semibold text-slate-900 line-clamp-2">
                          {question.text || 'Image-based question'}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span>{question.options.length} options</span>
                          {question.imageUrl && <span>Question image attached</span>}
                          {question.optionImages?.some(Boolean) && <span>Option images attached</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                        {question.category}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getDifficultyBadgeClasses(question.difficulty || 'Easy')}`}>
                        {question.difficulty || 'Easy'}
                      </span>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(question)}
                          className="rounded-lg p-2 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600"
                          title="Edit question"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(question.id!)}
                          className="rounded-lg p-2 text-slate-400 transition-all hover:bg-red-50 hover:text-red-600"
                          title="Delete question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsModalOpen(false);
                setEditingId(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 p-6 shrink-0">
                <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Question' : 'Add New Question'}</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="rounded-full p-2 hover:bg-slate-100"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={e => handleSave(e, false)} className="flex min-h-0 flex-col">
                <div className="space-y-6 overflow-y-auto p-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Question Text</label>
                    <textarea
                      value={formData.text}
                      onChange={e => setFormData(prev => ({ ...prev, text: e.target.value }))}
                      className="min-h-[110px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter question text (optional if image is uploaded)"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Question Image</label>
                    <div className="flex flex-wrap items-center gap-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileChange(e, 'imageUrl')}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-2 text-sm"
                        title="Upload question image"
                      />
                      {formData.imageUrl && (
                        <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-slate-200">
                          <img src={formData.imageUrl} className="h-full w-full object-cover" alt="Question preview" />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                            className="absolute right-0 top-0 rounded-bl-lg bg-red-500 p-0.5 text-white"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as QuestionCategory }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Category"
                      >
                        <option value="Quant">Quantitative</option>
                        <option value="Reasoning">Reasoning</option>
                        <option value="Verbal">Verbal</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Difficulty</label>
                      <select
                        value={formData.difficulty}
                        onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value as QuestionDifficulty }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Difficulty"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">Correct Answer</label>
                      <select
                        required
                        value={formData.correctAnswer}
                        onChange={e => setFormData(prev => ({ ...prev, correctAnswer: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Correct answer"
                      >
                        <option value="">Select correct option</option>
                        {formData.options.map((option, index) => {
                          const resolved = option.trim() || (formData.optionImages?.[index] ? optionLabel(index) : '');
                          if (!resolved) return null;
                          return (
                            <option key={`${index}-${resolved}`} value={resolved}>
                              Option {String.fromCharCode(65 + index)}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-slate-700">Options and Images</label>

                    {formData.options.map((option, index) => (
                      <div key={index} className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-500">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={e => {
                              const nextOptions = [...formData.options];
                              nextOptions[index] = e.target.value;
                              setFormData(prev => ({ ...prev, options: nextOptions }));
                            }}
                            className="flex-1 rounded-xl border border-slate-200 bg-white p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder={`Option ${String.fromCharCode(65 + index)} text`}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pl-[52px]">
                          <div className="flex min-w-[220px] flex-1 items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleFileChange(e, 'optionImage', index)}
                              className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs"
                              title={`Upload option ${String.fromCharCode(65 + index)} image`}
                            />
                          </div>

                          {formData.optionImages?.[index] && (
                            <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200">
                              <img src={formData.optionImages[index]} className="h-full w-full object-cover" alt={`Option ${String.fromCharCode(65 + index)} preview`} />
                              <button
                                type="button"
                                onClick={() => {
                                  const nextImages = [...(formData.optionImages || ['', '', '', ''])];
                                  nextImages[index] = '';
                                  setFormData(prev => ({ ...prev, optionImages: nextImages }));
                                }}
                                className="absolute right-0 top-0 rounded-bl-lg bg-red-500 p-0.5 text-white"
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

                  {formData.imageUrl && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 text-sm font-bold text-slate-700">Question Image Preview</div>
                      <img src={formData.imageUrl} alt="Question preview" className="max-h-64 rounded-xl border border-slate-200 bg-white object-contain" />
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50 p-6 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-slate-600 transition-all hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={e => handleSave(e as unknown as React.FormEvent, true)}
                    className="flex-1 rounded-xl border border-indigo-100 bg-indigo-50 px-6 py-3 font-bold text-indigo-600 transition-all hover:bg-indigo-100"
                  >
                    Save and Add Another
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition-all hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                  >
                    Save and Close
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
