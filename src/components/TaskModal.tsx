import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import type { Task } from '../types/index.js';

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose }) => {
  const { project, addTask, updateTask } = useStore();
  const isEdit = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeIds: [] as string[],
    status: 'not_started' as Task['status'],
    priority: 'medium' as Task['priority'],
    progress: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    category: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assigneeIds: task.assigneeIds || [],
        status: task.status,
        priority: task.priority,
        progress: task.progress,
        startDate: task.startDate,
        dueDate: task.dueDate,
        category: task.category,
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.assigneeIds.length === 0) {
      alert('少なくとも1人の担当者を選択してください');
      return;
    }
    
    if (isEdit && task) {
      updateTask(task.id, formData);
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
      };
      addTask(newTask);
    }
    
    onClose();
  };

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'タスクを編集' : '新規タスク作成'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タスク名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              担当者 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {project.members.map(member => (
                <label key={member.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.assigneeIds.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, assigneeIds: [...formData.assigneeIds, member.id] });
                      } else {
                        setFormData({ ...formData, assigneeIds: formData.assigneeIds.filter(id => id !== member.id) });
                      }
                    }}
                    className="rounded"
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: member.color }}
                  />
                  <span className="text-sm">{member.name}</span>
                </label>
              ))}
            </div>
            {formData.assigneeIds.length === 0 && (
              <p className="text-red-500 text-xs mt-1">少なくとも1人の担当者を選択してください</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 2D/3D開発、AI設定、ビジュアルなど"
              list="category-suggestions"
            />
            <datalist id="category-suggestions">
              {project.categories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ステータス
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="not_started">未着手</option>
                <option value="in_progress">進行中</option>
                <option value="completed">完了</option>
                <option value="blocked">ブロック</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                優先度
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              進捗率: {formData.progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                期限 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {isEdit ? '更新' : '作成'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;