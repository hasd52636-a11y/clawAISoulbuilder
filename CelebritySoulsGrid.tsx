/**
 * Celebrity Souls Grid Component
 * 名人数字灵魂库网格组件
 * 
 * 展示所有灵魂卡片的水平循环滚动布局
 */

import React, { useState } from 'react';
import { listCelebritySouls, getCelebritySoul, convertSoulToAgentConfig } from '../utils/celebritySoulsSystem';
import { generateAllTemplates } from '../utils/agentTemplateGenerator';
import CelebritySoulsCard from './CelebritySoulsCard';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import styles from './CelebritySoulsGrid.module.css';

interface CelebritySoulsGridProps {
  onGenerate?: (templates: Record<string, string>, soulId: string) => void;
  onError?: (error: string) => void;
}

export const CelebritySoulsGrid: React.FC<CelebritySoulsGridProps> = ({
  onGenerate,
  onError,
}) => {
  const [selectedSoul, setSelectedSoul] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFullLibrary, setShowFullLibrary] = useState(false);
  const { isDark } = useTheme();
  const souls = listCelebritySouls();

  const handleSelect = (soulId: string) => {
    setSelectedSoul(soulId);
  };

  const handleGenerate = async (soulId: string) => {
    setIsGenerating(true);
    try {
      const soul = getCelebritySoul(soulId);
      if (!soul) throw new Error('灵魂未找到');

      const config = convertSoulToAgentConfig(soul);
      const templates = generateAllTemplates(config);

      onGenerate?.(templates, soulId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '生成失败';
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // 完整名人库弹窗
  if (showFullLibrary) {
    return (
      <>
        {/* 背景遮罩 */}
        <div className={styles.modal_overlay} onClick={() => setShowFullLibrary(false)} />
        
        {/* 弹窗内容 */}
        <div className={styles.modal_content}>
          <div className={styles.modal_header}>
            <h2 className={styles.modal_title}>名人数字灵魂库</h2>
            <button 
              className={styles.close_button}
              onClick={() => setShowFullLibrary(false)}
            >
              ✕
            </button>
          </div>
          
          <p className={styles.modal_subtitle}>选择世界顶级人士的思维模式，一键注入灵魂</p>

          {/* 完整网格展示 */}
          <div className={styles.full_library_grid}>
            {souls.map(soul => (
              <CelebritySoulsCard
                key={soul.id}
                soulId={soul.id}
                isSelected={selectedSoul === soul.id}
                onSelect={handleSelect}
                onGenerate={handleGenerate}
              />
            ))}
          </div>
        </div>

        {/* 加载状态 */}
        {isGenerating && (
          <div className={styles.loading_overlay}>
            <div className={styles.loading_spinner}>
              <div className={styles.spinner}></div>
              <p>正在注入灵魂...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className={`${styles.celebrity_souls_grid_container} ${isDark ? styles.dark : styles.light}`}>
      {/* 主题切换按钮 */}
      <ThemeToggle />

      {/* 标题区域 */}
      <div className={styles.grid_header}>
        <h1 className={styles.grid_title}>名人数字灵魂库</h1>
        <p className={styles.grid_subtitle}>选择世界顶级人士的思维模式，一键注入灵魂</p>
      </div>

      {/* 名人数字灵魂库 - 水平循环滚动展示 */}
      <div className={styles.souls_sections}>
        <div className={styles.souls_section}>
          <div className={styles.section_header}>
            <h2 className={styles.section_title}>🌟 名人数字灵魂库</h2>
            <p className={styles.section_desc}>选择世界顶级人士的思维模式，一键注入灵魂</p>
          </div>
          
          {/* 水平循环滚动容器 */}
          <div className={styles.infinite_scroll_container}>
            <div className={styles.infinite_scroll_track}>
              {/* 复制两套卡片实现无缝循环 */}
              {souls.map(soul => (
                <CelebritySoulsCard
                  key={soul.id}
                  soulId={soul.id}
                  isSelected={selectedSoul === soul.id}
                  onSelect={handleSelect}
                  onGenerate={handleGenerate}
                />
              ))}
              {souls.map(soul => (
                <CelebritySoulsCard
                  key={`${soul.id}-dup`}
                  soulId={soul.id}
                  isSelected={selectedSoul === soul.id}
                  onSelect={handleSelect}
                  onGenerate={handleGenerate}
                />
              ))}
            </div>
          </div>

          {/* 更多按钮 */}
          <div className={styles.more_button_container}>
            <button 
              className={styles.more_button}
              onClick={() => setShowFullLibrary(true)}
            >
              <span>查看更多名人</span>
              <span className={styles.more_count}>共 {souls.length} 位</span>
            </button>
          </div>
        </div>
      </div>

      {/* 加载状态 */}
      {isGenerating && (
        <div className={styles.loading_overlay}>
          <div className={styles.loading_spinner}>
            <div className={styles.spinner}></div>
            <p>正在注入灵魂...</p>
          </div>
        </div>
      )}

      {/* 底部提示 */}
      <div className={styles.grid_footer}>
        <p className={styles.footer_text}>
          💡 提示：点击卡片选择，悬停时点击"注入灵魂"生成配置
        </p>
      </div>
    </div>
  );
};

export default CelebritySoulsGrid;
