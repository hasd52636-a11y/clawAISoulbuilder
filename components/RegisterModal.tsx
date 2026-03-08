import React, { useState } from 'react';
import { X } from 'lucide-react';
import { registerUser } from '../utils/auth';
import { DonationSection } from './DonationSection';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
  onRegisterSuccess: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSwitchToLogin,
  onRegisterSuccess 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    const result = registerUser(email, password, name);
    
    if (result.success) {
      onRegisterSuccess();
      // 清空表单
      setEmail('');
      setPassword('');
      setName('');
    } else {
      setError(result.message || '注册失败');
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-md relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-2">注册账户</h2>
          <p className="text-zinc-400 text-sm mb-6">创建您的ClawNexus账户</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="姓名 (可选)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={loading}
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="密码 (至少6位)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                disabled={loading}
              />
              <p className="text-zinc-500 text-xs mt-1">密码至少需要6位字符</p>
            </div>

            <button
              onClick={handleRegister}
              disabled={loading || !email || !password}
              className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  注册中...
                </>
              ) : (
                '注册'
              )}
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm text-center">
              已有账户？{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                立即登录
              </button>
            </p>
          </div>

          <DonationSection />
        </div>
      </div>
    </div>
  );
};