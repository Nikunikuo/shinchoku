# ネオスフィア進捗管理システム - CLAUDE.md

## システム概要
ネオスフィア展示会プロジェクトの進捗管理用Webアプリケーション。
ブラウザのLocalStorageを使用してデータを保存するため、サーバー不要で動作する。

## 技術スタック
- React + TypeScript
- Vite（ビルドツール）
- Tailwind CSS（スタイリング）
- Zustand（状態管理 + LocalStorage永続化）
- Recharts（グラフ表示）
- date-fns（日付処理）

## 主要機能

### 1. ダッシュボード
- プロジェクト全体の進捗状況を一覧表示
- タスクステータス分布（円グラフ）
- メンバー別進捗率（棒グラフ）
- 期限が近いタスク一覧
- 優先度別タスク数表示
- ガントチャート表示

### 2. タスク管理
- タスクのCRUD操作（作成・読取・更新・削除）
- 複数担当者の割り当て対応
- カテゴリの自由入力
- ステータス管理（未着手/進行中/完了/ブロック）
- 優先度設定（高/中/低）
- 進捗率管理（0-100%）
- 期限アラート機能（3日前：黄色、1日前：赤色）
- カラムクリックでソート機能
- タスク名ホバーで説明ポップアップ表示

### 3. メンバー管理
- メンバーの追加・編集・削除
- カラーテーマ設定
- メンバー別タスク統計表示

### 4. レポート機能
- 定例会用進捗レポートの自動生成（Markdown形式）
- クリップボードへのコピー
- ファイルダウンロード
- Discord Webhookでの送信

### 5. データ管理
- LocalStorageによる自動保存
- ブラウザリロード後もデータ保持

## データ構造

### Task
```typescript
{
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];  // 複数担当者対応
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  progress: number;  // 0-100
  startDate: string;
  dueDate: string;
  completedDate?: string;
  category: string;  // 自由入力
  dependencies?: string[];
}
```

### Member
```typescript
{
  id: string;
  name: string;
  role: string;
  color: string;  // HEXカラーコード
}
```

## 議事録からタスク生成プロンプト

以下のプロンプトを使用して、議事録からコンソール実行用のコードを生成できます：

```
以下の議事録から、ネオスフィア進捗管理システムにタスクを一括登録するためのJavaScriptコードを生成してください。

【議事録】
[ここに議事録を貼り付け]

【生成ルール】
1. 期限が明記されているものを優先的にタスク化
2. 担当者が決まっていない場合はassigneeIds: ['999']（未定）を使用
3. メンバーIDマッピング：
   - おぼろげ: '1'
   - 大鹿ニク: '2'
   - Kafy: '3'
   - Sasi: '4'
   - なちなに: '5'
   - Yossy徹: '6'
   - 未定: '999'
4. 優先度は期限の近さで判断（1週間以内：high、1ヶ月以内：medium、それ以外：low）
5. カテゴリは内容から適切に判断して自由に設定
6. descriptionには詳細情報を記載

【出力形式】
const d=JSON.parse(localStorage.getItem('neosphere-progress-storage'));
const t=Date.now();
d.state.project.tasks.push(
  {id:t+'_1',title:'タスク名',assigneeIds:['3'],status:'not_started',priority:'high',progress:0,startDate:'2025-07-19',dueDate:'2025-07-31',category:'開発',description:'詳細説明'},
  // 他のタスク...
);
localStorage.setItem('neosphere-progress-storage',JSON.stringify(d));
location.reload();
```

## トラブルシューティング

### コンソールにコードが貼り付けられない
Chromeのセキュリティ機能により、初回は`allow pasting`と入力する必要があります。

### データが消えた
LocalStorageをクリアすると全データが削除されます。定期的にレポート機能でバックアップを取ることを推奨。

### 新しいメンバーを追加する方法
1. メンバー管理画面から追加
2. または以下のコードをコンソールで実行：
```javascript
const s = JSON.parse(localStorage.getItem('neosphere-progress-storage'));
s.state.project.members.push({id:'新ID',name:'名前',role:'役割',color:'#カラーコード'});
localStorage.setItem('neosphere-progress-storage', JSON.stringify(s));
location.reload();
```

## 開発者向け情報

### ビルド方法
```bash
npm run build
```

### 開発サーバー起動
```bash
npm run dev
```

### 主要コンポーネント
- `App.tsx` - メインアプリケーション
- `components/Dashboard.tsx` - ダッシュボード
- `components/TaskList.tsx` - タスク一覧
- `components/MemberList.tsx` - メンバー管理
- `components/ReportView.tsx` - レポート生成
- `store/useStore.ts` - Zustand状態管理