/**
 * Theme Toggle Button
 * 主题切换按钮
 */

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle-btn"
      onClick={toggleTheme}
      title={mode === 'light' ? '切换到夜间模式' : '切换到日间模式'}
      aria-label="Toggle theme"
    >
      {mode === 'light' ? (
        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* 月亮图标 */}
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg className="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {/* 太阳图标 */}
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
    </button>
  );
};

const styles = `
.theme-toggle-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 100;
  box-shadow: 0 2px 8px var(--color-shadow);
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px var(--color-shadow);
  background: var(--color-bg-tertiary);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 24px;
  height: 24px;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (max-width: 768px) {
  .theme-toggle-btn {
    width: 44px;
    height: 44px;
    top: 16px;
    right: 16px;
  }

  .theme-icon {
    width: 20px;
    height: 20px;
  }
}
`;

export default ThemeToggle;
