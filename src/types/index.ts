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
  location?: string;
  education?: {
    degree?: string;
    college?: string;
    graduationYear?: string;
    specialization?: string;
  };
}

export type QuestionCategory = 'Quant' | 'Reasoning' | 'Verbal';

export interface Question {
  id?: string;
  text: string;
  options: string[];
  optionImages?: string[]; // Optional image URLs for each option
  correctAnswer: string;
  category: QuestionCategory;
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
  weakAreas: string[];
  accuracy: number;
  userName: string;
  userPhoto?: string;
  timestamp: string;
}
