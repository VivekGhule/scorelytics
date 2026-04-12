import { AuthService } from './authService';
import apiClient from './apiClient';
import { Question, Test, TestResult, QuestionCategory } from '../types';

// Repository Layer (API Access)
export const QuestionRepository = {
  async getAll() {
    try {
      const response = await apiClient.get('/questions');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error (LIST questions):', error);
      return [];
    }
  },
  async add(question: Omit<Question, 'id'>) {
    try {
      const response = await apiClient.post('/questions', question);
      return response.data;
    } catch (error) {
      console.error('API Error (CREATE questions):', error);
    }
  },
  async update(id: string, question: Partial<Question>) {
    try {
      await apiClient.patch(`/questions/${id}`, question);
    } catch (error) {
      console.error('API Error (UPDATE questions):', error);
    }
  },
  async delete(id: string) {
    try {
      await apiClient.delete(`/questions/${id}`);
    } catch (error) {
      console.error('API Error (DELETE questions):', error);
    }
  },
  async getByIds(ids: string[]) {
    try {
      const all = await this.getAll();
      return all.filter((q: Question) => ids.includes(q.id!));
    } catch (error) {
      console.error('API Error (GET questions):', error);
      return [];
    }
  }
};

export const TestRepository = {
  async getAll() {
    try {
      const response = await apiClient.get('/tests');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error (LIST tests):', error);
      return [];
    }
  },
  async getById(id: string) {
    try {
      const response = await apiClient.get(`/tests/${id}`);
      return response.data as Test;
    } catch (error) {
      console.error('API Error (GET tests):', error);
      return null;
    }
  },
  async add(test: Omit<Test, 'id'>) {
    try {
      const response = await apiClient.post('/tests', test);
      return response.data;
    } catch (error) {
      console.error('API Error (CREATE tests):', error);
    }
  },
  async update(id: string, test: Partial<Test>) {
    try {
      const response = await apiClient.patch(`/tests/${id}`, test);
      return response.data;
    } catch (error) {
      console.error('API Error (UPDATE tests):', error);
    }
  },
  async delete(id: string) {
    try {
      await apiClient.delete(`/tests/${id}`);
    } catch (error) {
      console.error('API Error (DELETE tests):', error);
    }
  }
};

export const ResultRepository = {
  async getByUserId(userId: string) {
    try {
      const response = await apiClient.get(`/results/user/${userId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error (LIST results user):', error);
      return [];
    }
  },
  async add(result: Omit<TestResult, 'id'>) {
    try {
      const response = await apiClient.post('/results', result);
      return response.data;
    } catch (error) {
      console.error('API Error (CREATE results):', error);
    }
  },
  async getAll() {
    try {
      const response = await apiClient.get('/results');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error (LIST results):', error);
      return [];
    }
  }
};

// Service Layer (Business Logic)
export const TestService = {
  async calculateResult(
    userId: string,
    userName: string,
    userPhoto: string | undefined,
    test: Test,
    answers: Record<string, string>,
    questions: Question[]
  ) {
    let score = 0;
    const subjectWise: Record<QuestionCategory, number> = {
      Quant: 0,
      Reasoning: 0,
      Verbal: 0
    };
    const totalBySubject: Record<QuestionCategory, number> = {
      Quant: 0,
      Reasoning: 0,
      Verbal: 0
    };

    questions.forEach(q => {
      totalBySubject[q.category]++;
      if (answers[q.id!] === q.correctAnswer) {
        score++;
        subjectWise[q.category]++;
      }
    });

    const weakAreas: string[] = [];
    (Object.keys(subjectWise) as QuestionCategory[]).forEach(cat => {
      const percentage = totalBySubject[cat] > 0 ? (subjectWise[cat] / totalBySubject[cat]) * 100 : 100;
      if (percentage < 50) {
        weakAreas.push(cat);
      }
    });

    const result: Omit<TestResult, 'id'> = {
      userId,
      testId: test.id!,
      testTitle: test.title,
      score,
      totalQuestions: questions.length,
      subjectWise,
      weakAreas,
      accuracy: (score / questions.length) * 100,
      userName,
      userPhoto,
      timestamp: new Date().toISOString()
    };

    return await ResultRepository.add(result);
  }
};

export const UserRepository = {
  async getById(id: string) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error (GET user):', error);
      return null;
    }
  },
  async getAll() {
    try {
      // Admin user listing (requires admin token)
      const response = await apiClient.get('/admin/users');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('API Error (LIST users):', error);
      return [];
    }
  },
  async update(id: string, data: any) {
    try {
      await apiClient.patch(`/admin/users/${id}`, data);
    } catch (error) {
      console.error('API Error (UPDATE user):', error);
    }
  },
  async updateProfile(id: string, data: any) {
    try {
      const response = await apiClient.patch(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('API Error (UPDATE self profile):', error);
      throw error;
    }
  },
  async delete(id: string) {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      console.error('API Error (DELETE user):', error);
    }
  }
};
