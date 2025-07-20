import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, Task, Member, WeeklyReport } from '../types/index.js';

interface AppState {
  project: Project | null;
  reports: WeeklyReport[];
  
  // Project actions
  initializeProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  
  // Member actions
  addMember: (member: Member) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  
  // Task actions
  addTask: (task: Task) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // Report actions
  addReport: (report: WeeklyReport) => void;
  updateReport: (id: string, report: Partial<WeeklyReport>) => void;
  deleteReport: (id: string) => void;
  
  // Utility
  getTasksByMember: (memberId: string) => Task[];
  getOverallProgress: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      project: null,
      reports: [],
      
      initializeProject: (project) => set({ project }),
      
      updateProject: (project) => set({ project }),
      
      addMember: (member) => set((state) => ({
        project: state.project ? {
          ...state.project,
          members: [...state.project.members, member]
        } : null
      })),
      
      updateMember: (id, memberUpdate) => set((state) => ({
        project: state.project ? {
          ...state.project,
          members: state.project.members.map(m => 
            m.id === id ? { ...m, ...memberUpdate } : m
          )
        } : null
      })),
      
      deleteMember: (id) => set((state) => ({
        project: state.project ? {
          ...state.project,
          members: state.project.members.filter(m => m.id !== id)
        } : null
      })),
      
      addTask: (task) => set((state) => ({
        project: state.project ? {
          ...state.project,
          tasks: [...state.project.tasks, task]
        } : null
      })),
      
      updateTask: (id, taskUpdate) => set((state) => ({
        project: state.project ? {
          ...state.project,
          tasks: state.project.tasks.map(t => 
            t.id === id ? { ...t, ...taskUpdate } : t
          )
        } : null
      })),
      
      deleteTask: (id) => set((state) => ({
        project: state.project ? {
          ...state.project,
          tasks: state.project.tasks.filter(t => t.id !== id)
        } : null
      })),
      
      addReport: (report) => set((state) => ({
        reports: [...state.reports, report]
      })),
      
      updateReport: (id, reportUpdate) => set((state) => ({
        reports: state.reports.map(r => 
          r.id === id ? { ...r, ...reportUpdate } : r
        )
      })),
      
      deleteReport: (id) => set((state) => ({
        reports: state.reports.filter(r => r.id !== id)
      })),
      
      getTasksByMember: (memberId) => {
        const state = get();
        return state.project?.tasks.filter(t => t.assigneeIds.includes(memberId)) || [];
      },
      
      getOverallProgress: () => {
        const state = get();
        if (!state.project || state.project.tasks.length === 0) return 0;
        
        const totalProgress = state.project.tasks.reduce((sum, task) => sum + task.progress, 0);
        return Math.round(totalProgress / state.project.tasks.length);
      }
    }),
    {
      name: 'neosphere-progress-storage',
      version: 1,
    }
  )
);