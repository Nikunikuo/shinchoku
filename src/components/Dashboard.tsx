import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, XCircle, ListTodo } from 'lucide-react';
import GanttChart from './GanttChart';

const getDueDateColor = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'bg-red-800 text-white';
  } else if (diffDays === 0 || diffDays === 1) {
    return 'bg-red-500 text-white';
  } else if (diffDays === 2 || diffDays === 3) {
    return 'bg-yellow-400 text-gray-800';
  } else {
    return 'bg-white text-gray-900';
  }
};

const Dashboard = () => {
  const { project } = useStore();
  
  if (!project) return null;

  // タスクステータス別の集計
  const taskStatusData = [
    { name: '未着手', value: project.tasks.filter(t => t.status === 'not_started').length, color: '#9CA3AF' },
    { name: '進行中', value: project.tasks.filter(t => t.status === 'in_progress').length, color: '#3B82F6' },
    { name: '完了', value: project.tasks.filter(t => t.status === 'completed').length, color: '#10B981' },
    { name: 'ブロック', value: project.tasks.filter(t => t.status === 'blocked').length, color: '#EF4444' },
  ];

  // メンバー別の進捗データ
  const memberProgressData = project.members.map(member => {
    const memberTasks = project.tasks.filter(t => t.assigneeIds.includes(member.id));
    const avgProgress = memberTasks.length > 0 
      ? Math.round(memberTasks.reduce((sum, task) => sum + task.progress, 0) / memberTasks.length)
      : 0;
    
    return {
      name: member.name,
      progress: avgProgress,
      taskCount: memberTasks.length,
    };
  });

  // 優先度別タスク数
  const priorityData = [
    { priority: '高', count: project.tasks.filter(t => t.priority === 'high').length },
    { priority: '中', count: project.tasks.filter(t => t.priority === 'medium').length },
    { priority: '低', count: project.tasks.filter(t => t.priority === 'low').length },
  ];

  // 直近のタスク
  const recentTasks = project.tasks
    .filter(t => t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">ダッシュボード</h2>
      
      {/* サマリーカード */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総タスク数</p>
              <p className="text-2xl font-bold text-gray-900">{project.tasks.length}</p>
            </div>
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">完了タスク</p>
              <p className="text-2xl font-bold text-green-600">
                {project.tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">進行中</p>
              <p className="text-2xl font-bold text-blue-600">
                {project.tasks.filter(t => t.status === 'in_progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">ブロック</p>
              <p className="text-2xl font-bold text-red-600">
                {project.tasks.filter(t => t.status === 'blocked').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* チャートエリア */}
      <div className="grid grid-cols-2 gap-6">
        {/* タスクステータス円グラフ */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">タスクステータス分布</h3>
          {project.tasks.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskStatusData.filter(item => item.value > 0)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {taskStatusData.filter(item => item.value > 0).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>タスクがありません</p>
            </div>
          )}
        </div>

        {/* メンバー別進捗 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">メンバー別進捗率</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} label={{ value: '進捗率(%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [`${value}%`, '進捗率']} />
              <Bar dataKey="progress" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 直近のタスクと優先度 */}
      <div className="grid grid-cols-2 gap-6">
        {/* 直近のタスク */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">期限が近いタスク</h3>
          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map(task => {
                const daysUntil = Math.ceil(
                  (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="relative group">
                        <p className="font-medium text-gray-900 cursor-help">{task.title}</p>
                        {task.description && (
                          <div className="absolute z-10 invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-2 px-3 left-0 top-6 w-64 shadow-lg">
                            <div className="whitespace-pre-wrap">{task.description}</div>
                            <div className="absolute top-[-4px] left-4 w-2 h-2 bg-gray-800 rotate-45"></div>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        担当: {task.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getDueDateColor(task.dueDate)}`}>
                        期限まで{daysUntil}日
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">タスクがありません</p>
            )}
          </div>
        </div>

        {/* 優先度別タスク */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">優先度別タスク数</h3>
          <div className="space-y-4">
            {priorityData.map((item) => (
              <div key={item.priority} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.priority === '高' ? 'bg-red-500' :
                    item.priority === '中' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <span className="font-medium">{item.priority}優先度</span>
                </div>
                <span className="text-2xl font-bold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ガントチャート */}
      <GanttChart />
    </div>
  );
};

export default Dashboard;