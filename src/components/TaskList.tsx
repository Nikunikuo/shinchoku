import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import TaskModal from './TaskModal';
import type { Task } from '../types/index.js';

const TaskList = () => {
  const { project, deleteTask } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed' | 'blocked'>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  if (!project) return null;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortedTasks = (tasks: Task[]) => {
    if (!sortField) return tasks;

    return [...tasks].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'assignee':
          aValue = a.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ').toLowerCase();
          bValue = b.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ').toLowerCase();
          break;
        case 'status':
          const statusOrder = { 'not_started': 0, 'in_progress': 1, 'completed': 2, 'blocked': 3 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        case 'progress':
          aValue = a.progress;
          bValue = b.progress;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        case 'priority':
          const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const filteredTasks = project.tasks.filter(task => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (memberFilter !== 'all' && !task.assigneeIds.includes(memberFilter)) return false;
    return true;
  });

  const sortedTasks = getSortedTasks(filteredTasks);

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'blocked': return 'bg-red-100 text-red-700';
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'not_started': return '未着手';
      case 'in_progress': return '進行中';
      case 'completed': return '完了';
      case 'blocked': return 'ブロック';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
    }
  };

  const getDueDateColor = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // 期限過ぎ
      return 'bg-red-800 text-white';
    } else if (diffDays === 0 || diffDays === 1) {
      // 当日〜1日前
      return 'bg-red-500 text-white';
    } else if (diffDays === 2 || diffDays === 3) {
      // 2-3日前
      return 'bg-yellow-400 text-gray-800';
    } else {
      // それ以外
      return 'bg-white text-gray-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">タスク管理</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>新規タスク</span>
        </button>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="border rounded px-3 py-2"
            >
              <option value="all">すべて</option>
              <option value="not_started">未着手</option>
              <option value="in_progress">進行中</option>
              <option value="completed">完了</option>
              <option value="blocked">ブロック</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">担当者</label>
            <select
              value={memberFilter}
              onChange={(e) => setMemberFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">すべて</option>
              {project.members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* タスクリスト */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="w-72 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>タスク名</span>
                  {getSortIcon('title')}
                </div>
              </th>
              <th 
                className="w-40 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('assignee')}
              >
                <div className="flex items-center space-x-1">
                  <span>担当者</span>
                  {getSortIcon('assignee')}
                </div>
              </th>
              <th 
                className="w-28 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>ステータス</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th 
                className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('progress')}
              >
                <div className="flex items-center space-x-1">
                  <span>進捗</span>
                  {getSortIcon('progress')}
                </div>
              </th>
              <th 
                className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('dueDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>期限</span>
                  {getSortIcon('dueDate')}
                </div>
              </th>
              <th 
                className="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center space-x-1">
                  <span>優先度</span>
                  {getSortIcon('priority')}
                </div>
              </th>
              <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.length > 0 ? (
              sortedTasks.map(task => {
                const assignees = task.assigneeIds.map(id => project.members.find(m => m.id === id)).filter(Boolean);
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 relative group">
                          <span className="cursor-help">{task.title}</span>
                          {task.description && (
                            <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-6 w-64 shadow-lg">
                              <div className="whitespace-pre-wrap">{task.description}</div>
                              <div className="absolute top-[-4px] left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{task.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex -space-x-2">
                          {assignees.slice(0, 3).map((member) => (
                            <div 
                              key={member?.id}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs border-2 border-white"
                              style={{ backgroundColor: member?.color || '#666' }}
                              title={assignees.map(m => m?.name).join(', ')}
                            >
                              {member?.name.charAt(0)}
                            </div>
                          ))}
                          {assignees.length > 3 && (
                            <div 
                              className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs border-2 border-white"
                              title={assignees.map(m => m?.name).join(', ')}
                            >
                              +{assignees.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className="ml-2 text-sm text-gray-900">{task.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`px-2 py-1 rounded text-center font-medium ${getDueDateColor(task.dueDate)}`}>
                        {format(new Date(task.dueDate), 'M/d', { locale: ja })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  タスクがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default TaskList;