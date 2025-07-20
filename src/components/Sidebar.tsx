import { LayoutDashboard, ListTodo, Users, FileText } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: 'dashboard' | 'tasks' | 'members' | 'reports') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
    { id: 'tasks', label: 'タスク管理', icon: ListTodo },
    { id: 'members', label: 'メンバー管理', icon: Users },
    { id: 'reports', label: 'レポート', icon: FileText },
  ] as const;

  return (
    <div className="w-64 bg-gray-900 text-white h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold">ネオスフィア進捗管理</h2>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center space-x-3 px-6 py-3 text-left transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;