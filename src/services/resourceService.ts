import apiClient from './apiClient';
import { QuestionCategory, StudyResource, StudyResourceType } from '../types';

type ResourceFilters = {
  category?: QuestionCategory;
};

type ResourcePayload = {
  title: string;
  description?: string;
  category: QuestionCategory;
  type: StudyResourceType;
  noteContent?: string;
  file?: File | null;
};

const buildFormData = (payload: ResourcePayload) => {
  const formData = new FormData();
  formData.append('title', payload.title);
  formData.append('category', payload.category);
  formData.append('type', payload.type);
  formData.append('description', payload.description || '');
  formData.append('noteContent', payload.noteContent || '');

  if (payload.file) {
    formData.append('file', payload.file);
  }

  return formData;
};

export const ResourceRepository = {
  async getAll(filters?: ResourceFilters): Promise<StudyResource[]> {
    try {
      const response = await apiClient.get('/resources', {
        params: {
          category: filters?.category,
        },
      });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error (LIST resources):', error);
      return [];
    }
  },

  async add(payload: ResourcePayload): Promise<StudyResource | null> {
    try {
      const response = await apiClient.post('/resources', buildFormData(payload));
      return response.data as StudyResource;
    } catch (error) {
      console.error('API Error (CREATE resource):', error);
      throw error;
    }
  },

  async update(id: string, payload: ResourcePayload): Promise<StudyResource | null> {
    try {
      const response = await apiClient.patch(`/resources/${id}`, buildFormData(payload));
      return response.data as StudyResource;
    } catch (error) {
      console.error('API Error (UPDATE resource):', error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      await apiClient.delete(`/resources/${id}`);
    } catch (error) {
      console.error('API Error (DELETE resource):', error);
      throw error;
    }
  },

  async fetchFile(fileId: string, download = false) {
    return apiClient.get(`/resources/file/${fileId}`, {
      params: { download },
      responseType: 'blob',
    });
  },
};

export const openStudyResourcePreview = async (resource: StudyResource) => {
  if (!resource.fileId) {
    throw new Error('Missing fileId');
  }

  const response = await ResourceRepository.fetchFile(resource.fileId, false);
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  window.open(blobUrl, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
};

export const downloadStudyResourceFile = async (resource: StudyResource) => {
  if (!resource.fileId) {
    throw new Error('Missing fileId');
  }

  const response = await ResourceRepository.fetchFile(resource.fileId, true);
  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const anchor = document.createElement('a');
  anchor.href = blobUrl;
  anchor.download = resource.fileName || 'study-resource.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
};
