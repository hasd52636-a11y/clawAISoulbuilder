/**
 * Theme Context
 * 主题上下文 - 管理日间/夜间模式
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  // 从 localStorage 读取主题设置
  useEffect(() => {
    const savedMode = localStorage.getItem('theme-mode') as ThemeMode | null;
    if (savedMode) {
      setMode(savedMode);
    } else {
      // 检查系统偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    }
    setMounted(true);
  }, []);

  // 应用主题到 DOM
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);
    localStorage.setItem('theme-mode', mode);
  }, [mode, mounted]);

  const toggleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, isDark: mode === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
