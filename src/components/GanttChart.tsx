import { useStore } from '../store/useStore';
import { format, differenceInDays, addDays, startOfDay } from 'date-fns';
import { ja } from 'date-fns/locale';

const GanttChart = () => {
  const { project } = useStore();
  
  if (!project || project.tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">ガントチャート</h3>
        <p className="text-gray-500 text-center py-8">タスクがありません</p>
      </div>
    );
  }

  // 全タスクの最も早い開始日と最も遅い終了日を取得
  const startDates = project.tasks.map(t => new Date(t.startDate));
  const endDates = project.tasks.map(t => new Date(t.dueDate));
  const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
  
  // チャートの開始日と終了日（余裕を持たせる）
  const chartStartDate = addDays(minDate, -7);
  const chartEndDate = addDays(maxDate, 7);
  const totalDays = differenceInDays(chartEndDate, chartStartDate) + 1;

  // 日付のヘッダーと週単位の区切り線を生成
  const dateHeaders = [];
  const weekLines = [];
  
  for (let i = 0; i < totalDays; i++) {
    const date = addDays(chartStartDate, i);
    
    // 水曜日ごとに週の区切り線を追加（定例会基準）
    if (date.getDay() === 3) {
      weekLines.push({
        position: (i / totalDays) * 100,
        date: format(date, 'M/d', { locale: ja })
      });
    }
    
    // 日付ヘッダー（水曜日と月初めに表示）
    if (date.getDay() === 3 || date.getDate() === 1 || i === 0) {
      dateHeaders.push({
        date,
        position: i,
        label: format(date, 'M/d', { locale: ja })
      });
    }
  }

  const getTaskPosition = (task: any) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.dueDate);
    const startOffset = differenceInDays(taskStart, chartStartDate);
    const duration = differenceInDays(taskEnd, taskStart) + 1;
    
    return {
      left: `${(startOffset / totalDays) * 100}%`,
      width: `${(duration / totalDays) * 100}%`
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'blocked': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  // タスクから実際に使用されているカテゴリを取得してグループ化
  const actualCategories = [...new Set(project.tasks.map(t => t.category))];
  const tasksByCategory = actualCategories.reduce((acc: Record<string, any[]>, category: string) => {
    acc[category] = project.tasks.filter(t => t.category === category);
    return acc;
  }, {});

  // 今日の位置を計算
  const today = startOfDay(new Date());
  const todayOffset = differenceInDays(today, chartStartDate);
  const todayPosition = `${(todayOffset / totalDays) * 100}%`;

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">ガントチャート</h3>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] relative">
          {/* 日付ヘッダー */}
          <div className="relative h-10 border-b border-gray-200 mb-4">
            {dateHeaders.map((header, index) => (
              <div
                key={index}
                className="absolute text-xs text-gray-600 font-medium"
                style={{ left: `${(header.position / totalDays) * 100}%` }}
              >
                {header.label}
              </div>
            ))}
          </div>

          {/* 週単位の縦線（水曜日・定例会） */}
          {weekLines.map((line, index) => (
            <div
              key={index}
              className="absolute top-10 bottom-0"
              style={{ 
                left: `${line.position}%`,
              }}
            >
              <div className="absolute top-0 bottom-0 w-px" style={{ borderLeft: '2px dashed #3B82F6' }} />
              <div className="absolute -top-10 -left-8 text-xs text-blue-600 font-medium bg-white px-1">
                定例会
              </div>
            </div>
          ))}

          {/* タスク行 */}
          <div className="space-y-2">
            {Object.entries(tasksByCategory).map(([category, tasks]: [string, any[]]) => (
              tasks.length > 0 && (
                <div key={category}>
                  <div className="text-sm font-semibold text-gray-700 mb-1">{category}</div>
                  {tasks.map((task: any) => {
                    const assignees = task.assigneeIds.map((id: string) => project.members.find(m => m.id === id)).filter(Boolean);
                    const position = getTaskPosition(task);
                    
                    return (
                      <div key={task.id} className="relative h-10 mb-1">
                        <div className="absolute left-0 w-40 pr-2 text-sm truncate">
                          {task.title}
                        </div>
                        <div className="absolute left-40 right-0 h-full">
                          <div className="relative h-full bg-gray-50 rounded">
                            <div
                              className={`absolute h-full rounded ${getStatusColor(task.status)} opacity-80`}
                              style={position}
                            >
                              <div className="px-1 text-xs text-white truncate leading-10">
                                {assignees.map((m: any) => m?.name).join(', ')} ({task.progress}%)
                              </div>
                            </div>
                            {/* 進捗バー */}
                            <div
                              className={`absolute h-1 bottom-0 ${getStatusColor(task.status)} rounded`}
                              style={{
                                left: position.left,
                                width: `${(parseFloat(position.width) * task.progress) / 100}%`
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ))}
          </div>

          {/* 今日の線 - 実際にタスクがある場合のみ表示 */}
          {actualCategories.length > 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 opacity-50"
              style={{ left: todayPosition }}
            >
              <div className="absolute -top-5 -left-4 text-xs text-red-500">今日</div>
            </div>
          )}
        </div>
      </div>

      {/* 凡例 */}
      <div className="flex space-x-4 mt-6 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span>未着手</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>進行中</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>完了</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>ブロック</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;