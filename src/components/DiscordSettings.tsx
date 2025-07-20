import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

interface DiscordSettingsProps {
  onSend: (webhookUrl: string) => void;
  reportText: string;
}

const DiscordSettings: React.FC<DiscordSettingsProps> = ({ reportText }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    // LocalStorageから保存されたWebhook URLを読み込む
    const saved = localStorage.getItem('discord_webhook_url');
    if (saved) {
      setWebhookUrl(saved);
    }
  }, []);

  const handleSend = async () => {
    if (!webhookUrl) {
      alert('Discord Webhook URLを入力してください');
      return;
    }

    setIsSending(true);
    
    try {
      // Discord用にMarkdownをフォーマット
      const discordMessage = {
        content: reportText.substring(0, 2000), // Discordの文字数制限
        username: 'ネオスフィア進捗管理',
        avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=neosphere'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(discordMessage),
      });

      if (response.ok) {
        alert('Discordに送信しました！');
        // Webhook URLを保存
        localStorage.setItem('discord_webhook_url', webhookUrl);
      } else {
        throw new Error('送信に失敗しました');
      }
    } catch (error: any) {
      alert('エラーが発生しました: ' + error.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">Discord連携</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discord Webhook URL
          </label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://discord.com/api/webhooks/..."
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            ※ Discord のサーバー設定 → 連携サービス → Webhook から取得できます
          </p>
        </div>

        <button
          onClick={handleSend}
          disabled={!webhookUrl || isSending}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition ${
            !webhookUrl || isSending
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSending ? '送信中...' : 'Discordに送信'}</span>
        </button>
      </div>
    </div>
  );
};

export default DiscordSettings;