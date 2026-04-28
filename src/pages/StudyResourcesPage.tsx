import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { QuestionCategory, StudyResource, StudyResourceType } from '../types';
import { ResourceRepository, openStudyResourcePreview, downloadStudyResourceFile } from '../services/resourceService';
import { toast } from 'sonner';
import { BookOpen, FileText, Download, Eye, Plus, Save, Trash2, Edit2 } from 'lucide-react';

type ResourceFormData = {
  title: string;
  description: string;
  category: QuestionCategory;
  type: StudyResourceType;
  noteContent: string;
  file: File | null;
};

const DEFAULT_FORM: ResourceFormData = {
  title: '',
  description: '',
  category: 'Quant',
  type: 'NOTE',
  noteContent: '',
  file: null,
};

const CATEGORY_FILTERS = ['All', 'Quant', 'Reasoning', 'Verbal'] as const;

const StudyResourcesPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<(typeof CATEGORY_FILTERS)[number]>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<ResourceFormData>(DEFAULT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const data = await ResourceRepository.getAll();
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources', error);
      toast.error('Unable to load resources');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (formData.type === 'NOTE' && !formData.noteContent.trim()) {
      toast.error('Note content is required');
      return;
    }

    if (formData.type === 'PDF' && !editingId && !formData.file) {
      toast.error('Please upload a PDF file');
      return;
    }

    if (formData.file && formData.file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        type: formData.type,
        noteContent: formData.type === 'NOTE' ? formData.noteContent.trim() : '',
        file: formData.type === 'PDF' ? formData.file : null,
      };

      if (editingId) {
        await ResourceRepository.update(editingId, payload);
        toast.success('Resource updated');
      } else {
        await ResourceRepository.add(payload);
        toast.success('Resource created');
      }

      resetForm();
      await fetchResources();
    } catch (error: any) {
      console.error('Failed to save resource', error);
      const message = error?.response?.data?.error || 'Failed to save resource';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (resource: StudyResource) => {
    setEditingId(resource.id || null);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      category: resource.category,
      type: resource.type,
      noteContent: resource.noteContent || '',
      file: null,
    });
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this resource?')) return;

    try {
      await ResourceRepository.delete(id);
      toast.success('Resource deleted');
      await fetchResources();
    } catch (error: any) {
      console.error('Failed to delete resource', error);
      const message = error?.response?.data?.error || 'Failed to delete resource';
      toast.error(message);
    }
  };

  const filteredResources = useMemo(
    () =>
      resources.filter((resource) => {
        const matchesCategory = filterCategory === 'All' || resource.category === filterCategory;
        const haystack = `${resource.title} ${resource.description || ''} ${resource.category} ${resource.type}`.toLowerCase();
        const matchesSearch = haystack.includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
      }),
    [resources, filterCategory, searchTerm]
  );

  const getTypeBadgeClasses = (type: StudyResourceType) =>
    type === 'NOTE'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : 'border-indigo-200 bg-indigo-50 text-indigo-700';

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Study Resources</h1>
          <p className="text-slate-500 dark:text-slate-400">Browse notes and PDFs by category, or manage them as an admin.</p>
        </div>
      </header>

      {isAdmin && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{editingId ? 'Edit Resource' : 'Add Resource'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upload PDFs or publish note-based resources.</p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Resource title"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Short description"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as QuestionCategory }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Category"
              >
                <option value="Quant">Quant</option>
                <option value="Reasoning">Reasoning</option>
                <option value="Verbal">Verbal</option>
              </select>

              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as StudyResourceType, file: null }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Resource type"
              >
                <option value="NOTE">Note</option>
                <option value="PDF">PDF</option>
              </select>

              {formData.type === 'PDF' ? (
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                  title="Upload PDF"
                />
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  Note resources do not require a file upload.
                </div>
              )}
            </div>

            {formData.type === 'NOTE' && (
              <textarea
                value={formData.noteContent}
                onChange={(e) => setFormData(prev => ({ ...prev, noteContent: e.target.value }))}
                placeholder="Write notes here..."
                className="min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Saving...' : editingId ? 'Update Resource' : 'Add Resource'}
            </button>
          </form>
        </section>
      )}

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources..."
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as (typeof CATEGORY_FILTERS)[number])}
            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Filter by category"
          >
            {CATEGORY_FILTERS.map((option) => (
              <option key={option} value={option}>
                {option === 'All' ? 'All Categories' : option}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Loading resources...</div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white py-16 text-center text-slate-400 dark:border-slate-800 dark:bg-slate-900">
          No resources found for the current filter.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {filteredResources.map((resource) => {
            const isExpanded = expandedNoteId === resource.id;
            return (
              <div
                key={resource.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                        {resource.category}
                      </span>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getTypeBadgeClasses(resource.type)}`}>
                        {resource.type}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{resource.title}</h3>
                    {resource.description && (
                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{resource.description}</p>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(resource)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                        title="Edit resource"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(resource.id!)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Delete resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {resource.type === 'NOTE' ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                      {isExpanded ? resource.noteContent : `${resource.noteContent?.slice(0, 240) || ''}${(resource.noteContent?.length || 0) > 240 ? '...' : ''}`}
                    </div>
                    {(resource.noteContent?.length || 0) > 240 && (
                      <button
                        type="button"
                        onClick={() => setExpandedNoteId(isExpanded ? null : resource.id || null)}
                        className="text-sm font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        {isExpanded ? 'Show less' : 'Read full note'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => openStudyResourcePreview(resource).catch(() => toast.error('Unable to open PDF'))}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="w-4 h-4" />
                      Preview PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadStudyResourceFile(resource).catch(() => toast.error('Unable to download PDF'))}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white hover:bg-indigo-700"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    {resource.fileName && (
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        <FileText className="w-4 h-4" />
                        {resource.fileName}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudyResourcesPage;
