import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';
import type { Member } from '../types/index.js';

interface MemberModalProps {
  member?: Member | null;
  onClose: () => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ member, onClose }) => {
  const { addMember, updateMember } = useStore();
  const isEdit = !!member;

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    color: '#3B82F6',
  });

  const colorOptions = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#DDA0DD', '#FF8B94', '#B4A7D6',
    '#FFB6C1', '#87CEEB', '#98D8C8', '#F7DC6F'
  ];

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        role: member.role,
        color: member.color,
      });
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit && member) {
      updateMember(member.id, formData);
    } else {
      const newMember: Member = {
        id: Date.now().toString(),
        ...formData,
      };
      addMember(newMember);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEdit ? 'メンバーを編集' : '新規メンバー追加'}
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
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              役割 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例: 2D/3D開発、ビジュアル設計など"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              テーマカラー
            </label>
            <div className="grid grid-cols-6 gap-2 mt-2">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-10 h-10 rounded-md ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center space-x-2">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="h-10"
              />
              <span className="text-sm text-gray-600">{formData.color}</span>
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
              {isEdit ? '更新' : '追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;