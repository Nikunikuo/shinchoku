import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit, Trash2, ListTodo } from 'lucide-react';
import MemberModal from './MemberModal';
import type { Member } from '../types/index.js';

const MemberList = () => {
  const { project, deleteMember } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  if (!project) return null;

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMember(null);
  };

  const getMemberStats = (memberId: string) => {
    const tasks = project.tasks.filter(t => t.assigneeIds.includes(memberId));
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const avgProgress = tasks.length > 0
      ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
      : 0;

    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      avgProgress
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">メンバー管理</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>メンバー追加</span>
        </button>
      </div>

      {/* メンバーカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {project.members.map(member => {
          const stats = getMemberStats(member.id);
          
          return (
            <div key={member.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.role}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMember(member.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">総タスク数</span>
                  <span className="text-lg font-semibold">{stats.totalTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">完了タスク</span>
                  <span className="text-lg font-semibold text-green-600">{stats.completedTasks}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">進行中</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.inProgressTasks}</span>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">平均進捗率</span>
                    <span className="font-semibold">{stats.avgProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.avgProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* タスク一覧へのリンク */}
              <button className="mt-4 w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 text-sm">
                <ListTodo className="w-4 h-4" />
                <span>タスクを見る</span>
              </button>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <MemberModal
          member={editingMember}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MemberList;