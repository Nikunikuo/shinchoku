import { Calendar, Users, Target, Download, Upload, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const Header = () => {
  const { project, getOverallProgress } = useStore();

  const handleExport = () => {
    const data = localStorage.getItem('neosphere-progress-storage');
    if (!data) {
      alert('エクスポートするデータがありません');
      return;
    }

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neosphere_progress_${format(new Date(), 'yyyyMMdd_HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          // JSONの妥当性をチェック
          JSON.parse(jsonData);
          
          if (confirm('現在のデータが上書きされます。よろしいですか？')) {
            localStorage.setItem('neosphere-progress-storage', jsonData);
            alert('データをインポートしました！ページを再読み込みします。');
            window.location.reload();
          }
        } catch (error) {
          alert('無効なJSONファイルです');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // HTMLエクスポート機能はコメントアウト

  const handleSimpleReport = () => {
    if (!project) return;
    
    const now = new Date();
    const completedTasks = project.tasks.filter(t => t.status === 'completed');
    const inProgressTasks = project.tasks.filter(t => t.status === 'in_progress');
    const blockedTasks = project.tasks.filter(t => t.status === 'blocked');
    const notStartedTasks = project.tasks.filter(t => t.status === 'not_started');
    const overallProgress = project.tasks.length > 0
      ? Math.round(project.tasks.reduce((sum, task) => sum + task.progress, 0) / project.tasks.length)
      : 0;

    // カテゴリ機能は使用していないため削除

    // 優先度別集計
    const highPriorityTasks = project.tasks.filter(t => t.priority === 'high');
    const mediumPriorityTasks = project.tasks.filter(t => t.priority === 'medium');
    const lowPriorityTasks = project.tasks.filter(t => t.priority === 'low');

    // 期限別集計
    const urgentTasks = project.tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 3 && t.status !== 'completed';
    });

    const overdueTasks = project.tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < now && t.status !== 'completed';
    });

    // 進捗状況のビジュアル表現
    const getProgressBar = (progress: number) => {
      const filled = Math.round(progress / 5); // 20個の■で100%
      const empty = 20 - filled;
      return '■'.repeat(filled) + '□'.repeat(empty);
    };

    // シンプルなHTMLレポートを生成
    const simpleHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} 進捗レポート</title>
    <style>
        body { 
            font-family: 'Hiragino Sans', 'Yu Gothic', sans-serif; 
            line-height: 1.5; 
            max-width: 900px; 
            margin: 0 auto; 
            padding: 20px;
            background: white;
            color: #333;
        }
        
        h1 { 
            color: #2563eb; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 10px; 
            font-size: 2em;
        }
        
        h2 { 
            color: #1e40af; 
            margin-top: 30px; 
            font-size: 1.4em;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
        }
        
        h3 {
            color: #1f2937;
            margin-top: 20px;
            font-size: 1.2em;
        }
        
        .header-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            margin: 20px 0;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-card {
            background: white;
            border: 2px solid #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #2563eb;
        }
        
        .stat-label {
            color: #64748b;
            font-size: 0.9em;
        }
        
        .progress-visual {
            font-family: monospace;
            font-size: 0.8em;
            margin: 5px 0;
            color: #059669;
        }
        
        .section {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
        }
        
        .task-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            background: white;
        }
        
        .task-table th,
        .task-table td {
            border: 1px solid #e5e7eb;
            padding: 12px 8px;
            text-align: left;
        }
        
        .task-table th {
            background: #f1f5f9;
            font-weight: bold;
            color: #1e293b;
        }
        
        .status-completed { background: #dcfce7; }
        .status-progress { background: #dbeafe; }
        .status-blocked { background: #fee2e2; }
        .status-not-started { background: #f1f5f9; }
        
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #ea580c; }
        .priority-low { color: #059669; }
        
        .urgent { background: #fef2f2; border-left: 4px solid #dc2626; }
        .overdue { background: #7f1d1d; color: white; border-left: 4px solid #dc2626; }
        
        .member-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .member-table th,
        .member-table td {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
        }
        
        .member-table th {
            background: #f1f5f9;
            font-weight: bold;
        }
        
        .category-row {
            background: #f8fafc;
            font-weight: bold;
        }
        
        .date-info { 
            color: #6b7280; 
            font-size: 0.9em; 
            text-align: right; 
            margin-bottom: 20px;
        }
        
        .alert-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }
        
        .summary-text {
            font-size: 1.1em;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <h1>📊 ${project.name} 進捗レポート</h1>
    <div class="date-info">📅 作成日時: ${format(now, 'yyyy年M月d日 HH:mm', { locale: ja })}</div>
    
    <div class="header-info">
        <div class="summary-text">
            <strong>プロジェクト概要:</strong> ${project.description}<br>
            <strong>目標期日:</strong> ${format(new Date(project.targetDate), 'yyyy年M月d日', { locale: ja })} 
            (残り${Math.ceil((new Date(project.targetDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))}日)<br>
            <strong>チームメンバー:</strong> ${project.members.length}名<br>
            <strong>全体進捗:</strong> <span style="font-size: 1.3em; color: #2563eb; font-weight: bold;">${overallProgress}%</span>
        </div>
        <div class="progress-visual">${getProgressBar(overallProgress)} ${overallProgress}%</div>
    </div>

    ${urgentTasks.length > 0 || overdueTasks.length > 0 ? `
    <div class="alert-box">
        <h3>🚨 注意が必要な項目</h3>
        ${overdueTasks.length > 0 ? `<p><strong>期限超過:</strong> ${overdueTasks.length}件のタスクが期限を過ぎています</p>` : ''}
        ${urgentTasks.length > 0 ? `<p><strong>緊急対応:</strong> ${urgentTasks.length}件のタスクが3日以内に期限です</p>` : ''}
        ${blockedTasks.length > 0 ? `<p><strong>ブロック中:</strong> ${blockedTasks.length}件のタスクが停止しています</p>` : ''}
    </div>
    ` : ''}

    <div class="section">
        <h2>📈 全体統計</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${project.tasks.length}</div>
                <div class="stat-label">総タスク数</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${completedTasks.length}</div>
                <div class="stat-label">完了済み</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${inProgressTasks.length}</div>
                <div class="stat-label">進行中</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${blockedTasks.length}</div>
                <div class="stat-label">ブロック中</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round((completedTasks.length / project.tasks.length) * 100)}%</div>
                <div class="stat-label">完了率</div>
            </div>
        </div>
    </div>


    <div class="section">
        <h2>👥 メンバー別詳細</h2>
        <table class="member-table">
            <thead>
                <tr>
                    <th>メンバー</th>
                    <th>役割</th>
                    <th>担当タスク数</th>
                    <th>完了数</th>
                    <th>進行中</th>
                    <th>平均進捗率</th>
                    <th>ビジュアル</th>
                </tr>
            </thead>
            <tbody>
                ${project.members.map(member => {
                  const memberTasks = project.tasks.filter(t => t.assigneeIds.includes(member.id));
                  const memberCompleted = memberTasks.filter(t => t.status === 'completed').length;
                  const memberInProgress = memberTasks.filter(t => t.status === 'in_progress').length;
                  const memberProgress = memberTasks.length > 0
                    ? Math.round(memberTasks.reduce((sum, task) => sum + task.progress, 0) / memberTasks.length)
                    : 0;
                  
                  return `
                    <tr>
                        <td><strong>${member.name}</strong></td>
                        <td>${member.role}</td>
                        <td>${memberTasks.length}</td>
                        <td>${memberCompleted}</td>
                        <td>${memberInProgress}</td>
                        <td>${memberProgress}%</td>
                        <td class="progress-visual">${getProgressBar(memberProgress)}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>⚡ 優先度別状況</h2>
        <table class="task-table">
            <thead>
                <tr>
                    <th>優先度</th>
                    <th>総数</th>
                    <th>完了</th>
                    <th>進行中</th>
                    <th>未着手</th>
                    <th>ブロック</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><span class="priority-high">🔴 高</span></td>
                    <td>${highPriorityTasks.length}</td>
                    <td>${highPriorityTasks.filter(t => t.status === 'completed').length}</td>
                    <td>${highPriorityTasks.filter(t => t.status === 'in_progress').length}</td>
                    <td>${highPriorityTasks.filter(t => t.status === 'not_started').length}</td>
                    <td>${highPriorityTasks.filter(t => t.status === 'blocked').length}</td>
                </tr>
                <tr>
                    <td><span class="priority-medium">🟡 中</span></td>
                    <td>${mediumPriorityTasks.length}</td>
                    <td>${mediumPriorityTasks.filter(t => t.status === 'completed').length}</td>
                    <td>${mediumPriorityTasks.filter(t => t.status === 'in_progress').length}</td>
                    <td>${mediumPriorityTasks.filter(t => t.status === 'not_started').length}</td>
                    <td>${mediumPriorityTasks.filter(t => t.status === 'blocked').length}</td>
                </tr>
                <tr>
                    <td><span class="priority-low">🟢 低</span></td>
                    <td>${lowPriorityTasks.length}</td>
                    <td>${lowPriorityTasks.filter(t => t.status === 'completed').length}</td>
                    <td>${lowPriorityTasks.filter(t => t.status === 'in_progress').length}</td>
                    <td>${lowPriorityTasks.filter(t => t.status === 'not_started').length}</td>
                    <td>${lowPriorityTasks.filter(t => t.status === 'blocked').length}</td>
                </tr>
            </tbody>
        </table>
    </div>

    ${overdueTasks.length > 0 ? `
    <div class="section">
        <h2>🚨 期限超過タスク</h2>
        <table class="task-table">
            <thead>
                <tr>
                    <th>タスク名</th>
                    <th>担当者</th>
                    <th>期限</th>
                    <th>超過日数</th>
                    <th>進捗</th>
                    <th>優先度</th>
                </tr>
            </thead>
            <tbody>
                ${overdueTasks.map(task => {
                  const assignees = task.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ');
                  const overdueDays = Math.ceil((now.getTime() - new Date(task.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                  return `
                    <tr class="overdue">
                        <td><strong>${task.title}</strong></td>
                        <td>${assignees}</td>
                        <td>${format(new Date(task.dueDate), 'M月d日', { locale: ja })}</td>
                        <td>${overdueDays}日超過</td>
                        <td>${task.progress}%</td>
                        <td class="priority-${task.priority}">${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    ${urgentTasks.length > 0 ? `
    <div class="section">
        <h2>⏰ 緊急対応が必要なタスク（3日以内期限）</h2>
        <table class="task-table">
            <thead>
                <tr>
                    <th>タスク名</th>
                    <th>担当者</th>
                    <th>期限</th>
                    <th>残り日数</th>
                    <th>進捗</th>
                    <th>優先度</th>
                </tr>
            </thead>
            <tbody>
                ${urgentTasks.map(task => {
                  const assignees = task.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ');
                  const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  return `
                    <tr class="urgent">
                        <td><strong>${task.title}</strong></td>
                        <td>${assignees}</td>
                        <td>${format(new Date(task.dueDate), 'M月d日', { locale: ja })}</td>
                        <td>${daysLeft}日</td>
                        <td>${task.progress}%</td>
                        <td class="priority-${task.priority}">${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <h2>📋 全タスク一覧（タスク管理画面と同じ情報）</h2>
        <p style="margin-bottom: 15px; color: #64748b;">🔍 ソフトのタスク管理画面の全情報を一覧表示。ステータス別に色分けしています。</p>
        <table class="task-table">
            <thead>
                <tr>
                    <th style="width: 22%;">タスク名</th>
                    <th style="width: 14%;">担当者</th>
                    <th style="width: 10%;">ステータス</th>
                    <th style="width: 10%;">進捗</th>
                    <th style="width: 10%;">期限</th>
                    <th style="width: 8%;">優先度</th>
                    <th style="width: 10%;">開始日</th>
                    <th style="width: 26%;">説明</th>
                </tr>
            </thead>
            <tbody>
                ${project.tasks.length > 0 ? project.tasks
                  .sort((a, b) => {
                    // ステータス順でソート（ブロック→進行中→未着手→完了）
                    const statusOrder = { 'blocked': 0, 'in_progress': 1, 'not_started': 2, 'completed': 3 };
                    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
                    if (statusDiff !== 0) return statusDiff;
                    
                    // 同じステータスなら期限順
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                  })
                  .map(task => {
                  const assignees = task.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ');
                  const dueDate = new Date(task.dueDate);
                  const startDate = new Date(task.startDate);
                  const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  
                  // 期限に応じたスタイル
                  let dueDateStyle = '';
                  if (task.status !== 'completed') {
                    if (diffDays < 0) {
                      dueDateStyle = 'background: #7f1d1d; color: white; font-weight: bold;'; // 期限過ぎ
                    } else if (diffDays <= 1) {
                      dueDateStyle = 'background: #dc2626; color: white; font-weight: bold;'; // 1日以内
                    } else if (diffDays <= 3) {
                      dueDateStyle = 'background: #fbbf24; color: #111827; font-weight: bold;'; // 3日以内
                    }
                  }
                  
                  const statusLabels = {
                    'not_started': '未着手',
                    'in_progress': '進行中', 
                    'completed': '完了',
                    'blocked': 'ブロック'
                  };
                  
                  const priorityLabels = {
                    'high': '🔴 高',
                    'medium': '🟡 中',
                    'low': '🟢 低'
                  };
                  
                  return `
                    <tr class="status-${task.status}">
                        <td><strong>${task.title}</strong></td>
                        <td>${assignees || '未割当'}</td>
                        <td><strong>${statusLabels[task.status]}</strong></td>
                        <td>
                            <div style="display: flex; align-items: center;">
                                <div style="flex: 1; background: #e5e7eb; height: 8px; border-radius: 4px; margin-right: 8px;">
                                    <div style="background: #3b82f6; height: 100%; border-radius: 4px; width: ${task.progress}%;"></div>
                                </div>
                                <span>${task.progress}%</span>
                            </div>
                        </td>
                        <td style="${dueDateStyle}">
                            ${format(dueDate, 'M/d', { locale: ja })}
                            ${task.status !== 'completed' ? (diffDays < 0 ? `<br><small>(${Math.abs(diffDays)}日超過)</small>` : diffDays <= 3 ? `<br><small>(${diffDays}日後)</small>` : '') : ''}
                        </td>
                        <td class="priority-${task.priority}">${priorityLabels[task.priority]}</td>
                        <td>${format(startDate, 'M/d', { locale: ja })}</td>
                        <td style="font-size: 0.9em; line-height: 1.3;">${task.description || '説明なし'}</td>
                    </tr>
                  `;
                }).join('') : '<tr><td colspan="8" style="text-align: center; color: #6b7280;">タスクがありません</td></tr>'}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>✅ 完了済みタスク詳細</h2>
        ${completedTasks.length > 0 ? `
        <table class="task-table">
            <thead>
                <tr>
                    <th>タスク名</th>
                    <th>担当者</th>
                    <th>完了日</th>
                    <th>期限</th>
                    <th>優先度</th>
                    <th>説明</th>
                </tr>
            </thead>
            <tbody>
                ${completedTasks.map(task => {
                  const assignees = task.assigneeIds.map(id => project.members.find(m => m.id === id)?.name).join(', ');
                  return `
                    <tr class="status-completed">
                        <td><strong>${task.title}</strong></td>
                        <td>${assignees}</td>
                        <td>${task.completedDate ? format(new Date(task.completedDate), 'M月d日', { locale: ja }) : '未設定'}</td>
                        <td>${format(new Date(task.dueDate), 'M月d日', { locale: ja })}</td>
                        <td class="priority-${task.priority}">${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</td>
                        <td style="font-size: 0.9em;">${task.description || '説明なし'}</td>
                    </tr>
                  `;
                }).join('')}
            </tbody>
        </table>
        ` : '<p>まだ完了したタスクはありません</p>'}
    </div>

    <div style="margin-top: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; text-align: center; color: #64748b;">
        <p>📊 このレポートは ${project.name} 進捗管理システムで自動生成されました</p>
        <p>生成日時: ${format(now, 'yyyy年M月d日 HH:mm:ss', { locale: ja })}</p>
    </div>
</body>
</html>`;

    const blob = new Blob([simpleHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}_進捗レポート_${format(now, 'yyyyMMdd_HHmm')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('シンプルなHTMLレポートをダウンロードしました！\nブラウザで開いてCtrl+Pで印刷→PDFに保存できます。');
  };
  
  if (!project) return null;
  
  const daysUntilTarget = Math.ceil(
    (new Date(project.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  
  const overallProgress = getOverallProgress();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-sm text-gray-600 mt-1">{project.description}</p>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* データ管理ボタン */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              title="データをエクスポート"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">エクスポート</span>
            </button>
            <button
              onClick={handleImport}
              className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              title="データをインポート"
            >
              <Upload className="w-4 h-4" />
              <span className="text-sm">インポート</span>
            </button>
            <button
              onClick={handleSimpleReport}
              className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              title="レポート出力"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">レポート出力</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">目標日</p>
              <p className="font-semibold text-gray-900">
                {format(new Date(project.targetDate), 'yyyy年M月d日', { locale: ja })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">メンバー</p>
              <p className="font-semibold text-gray-900">{project.members.length}名</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">残り日数</p>
              <p className="font-semibold text-gray-900">{daysUntilTarget}日</p>
            </div>
          </div>
          
          <div className="w-32">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">全体進捗</span>
              <span className="font-semibold text-gray-900">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;