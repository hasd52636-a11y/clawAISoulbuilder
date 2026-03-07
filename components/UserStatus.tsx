import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { getCurrentUser, logoutUser } from '../utils/auth';

interface UserStatusProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
  lang?: string;
}

export const UserStatus: React.FC<UserStatusProps> = ({ onShowLogin, onShowRegister, lang = 'ZH' }) => {
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [showDropdown, setShowDropdown] = useState(false);

  const { isZh, loginText, registerText, logoutText } = useMemo(() => {
    const isZhLang = lang === 'ZH' || lang === 'JA' || lang === 'KO';
    return {
      isZh: isZhLang,
      loginText: isZhLang ? '登录' : 'Login',
      registerText: isZhLang ? '注册' : 'Register',
      logoutText: isZhLang ? '退出登录' : 'Logout'
    };
  }, [lang]);

  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentUser(getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setShowDropdown(false);
    window.location.reload(); // 刷新页面更新状态
  };

  if (currentUser) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <User className="w-4 h-4 text-zinc-400" />
          <span className="text-sm text-zinc-300 max-w-[120px] truncate">
            {currentUser.name || currentUser.email.split('@')[0]}
          </span>
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        </button>

        {showDropdown && (
          <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg z-10 min-w-[140px]">
            <div className="p-2 border-b border-zinc-800">
              <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
              {currentUser.name && (
                <p className="text-sm text-zinc-300 font-medium truncate">{currentUser.name}</p>
              )}
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {logoutText}
            </button>
          </div>
        )}

        {/* 点击外部关闭下拉菜单 */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-0"
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onShowLogin}
        className="px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-sm"
      >
        {loginText}
      </button>
      <button
        onClick={onShowRegister}
        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors text-sm"
      >
        {registerText}
      </button>
    </div>
  );
};