import { useEffect, useState } from 'react';
import { useStore } from './store/useStore';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import MemberList from './components/MemberList';
import ReportView from './components/ReportView';
import ProjectSetup from './components/ProjectSetup';
import type { Project } from './types/index.js';

type ViewType = 'dashboard' | 'tasks' | 'members' | 'reports';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const { project, initializeProject } = useStore();

  useEffect(() => {
    // 初回起動時にプロジェクトがない場合、デフォルトプロジェクトを作成
    if (!project) {
      const defaultProject: Project = {
        id: '1',
        name: 'ネオスフィア展示会',
        description: 'AIが生きる世界を夏祭りという情緒と絡めて体験してもらう展示ブース',
        targetDate: '2025-09-06',
        members: [
          { id: '1', name: 'おぼろげ', role: 'AI絵師システム', color: '#FF6B6B' },
          { id: '2', name: '大鹿ニク', role: 'マネジメント', color: '#4ECDC4' },
          { id: '3', name: 'Kafy', role: '2D/3D開発', color: '#45B7D1' },
          { id: '4', name: 'Sasi', role: '2D/3D開発', color: '#96CEB4' },
          { id: '5', name: 'なちなに', role: 'ビジュアル設計', color: '#FECA57' },
          { id: '6', name: 'Yossy徹', role: 'ビジュアル設計', color: '#DDA0DD' }
        ],
        tasks: [],
        categories: ['2D/3D開発', 'AI設定', 'ビジュアル', 'システム', 'その他']
      };
      initializeProject(defaultProject);
    }
  }, [project, initializeProject]);

  if (!project) {
    return <ProjectSetup />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskList />;
      case 'members':
        return <MemberList />;
      case 'reports':
        return <ReportView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
