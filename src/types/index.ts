export type UserRole = 'USER' | 'ADMIN';
export type GenderPreference = 'male' | 'female';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
  gender?: GenderPreference;
  createdAt: string;
  phone?: string;
  dateOfBirth?: string;
  location?: string;
  education?: {
    degree?: string;
    college?: string;
    graduationYear?: string;
    specialization?: string;
  };
}

export type QuestionCategory = 'Quant' | 'Reasoning' | 'Verbal';
export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard';
export type DifficultyBucketKey = 'easy' | 'medium' | 'hard';
export type StudyResourceType = 'NOTE' | 'PDF';

export interface DifficultyBucket {
  correct: number;
  total: number;
}

export interface DifficultyStats {
  easy: DifficultyBucket;
  medium: DifficultyBucket;
  hard: DifficultyBucket;
}

export interface Question {
  id?: string;
  text: string;
  options: string[];
  optionImages?: string[]; // Optional image URLs for each option
  correctAnswer: string;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  imageUrl?: string;
  createdAt: string;
}

export interface Test {
  id?: string;
  title: string;
  category: QuestionCategory | 'Mixed';
  questionIds: string[];
  duration: number;
  createdAt: string;
}

export interface TestResult {
  id?: string;
  userId: string;
  testId: string;
  testTitle: string;
  score: number;
  totalQuestions: number;
  subjectWise: Record<QuestionCategory, number>;
  subjectTotals?: Record<QuestionCategory, number>;
  weakAreas: string[];
  accuracy: number;
  difficultyStats?: DifficultyStats;
  userName: string;
  userPhoto?: string;
  timestamp: string;
}

export interface StudyResource {
  id?: string;
  title: string;
  description?: string;
  category: QuestionCategory;
  type: StudyResourceType;
  noteContent?: string;
  fileId?: string;
  fileName?: string;
  createdAt: string;
  updatedAt?: string;
}
