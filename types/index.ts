export type ChatMode = 'chat' | 'task_wizard' | 'voice';

export type Persona = 'teacher' | 'farmer' | 'student' | 'senior' | 'job_seeker' | 'general';

export type Language = 'en' | 'hi';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  mode?: ChatMode;
  timestamp?: Date;
  sources?: Source[];
  confidence?: number;
  lastUpdated?: string;
  steps?: TaskStep[];
}

export interface Source {
  title: string;
  url: string;
  lastVerified: string;
  verified?: boolean;
}

export interface TaskStep {
  id: string;
  title: string;
  description: string;
  documents?: string[];
  completed?: boolean;
}

export interface SavedGuide {
  id: string;
  title: string;
  content: string;
  savedAt: Date;
  mode: ChatMode;
}

export interface ChatHistory {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  persona?: Persona;
  state?: string;
}

