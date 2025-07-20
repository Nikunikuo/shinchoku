export interface Member {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[]; // 複数担当者対応
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  progress: number; // 0-100
  startDate: string;
  dueDate: string;
  completedDate?: string;
  category: string;
  dependencies?: string[]; // task IDs
}

export interface Project {
  id: string;
  name: string;
  description: string;
  targetDate: string;
  members: Member[];
  tasks: Task[];
  categories: string[];
}

export interface WeeklyReport {
  id: string;
  date: string;
  projectId: string;
  completedTasks: string[];
  inProgressTasks: string[];
  blockedTasks: string[];
  nextWeekTasks: string[];
  notes: string;
}