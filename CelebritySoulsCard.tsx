/**
 * Celebrity Souls Card Component
 * 名人数字灵魂库卡片组件
 * 
 * 人物照片作为主体，一排设计
 * 包含人名、名言和灵魂注入按钮
 */

import React, { useState } from 'react';
import { getCelebritySoul } from '../utils/celebritySoulsSystem';
import styles from './CelebritySoulsCard.module.css';

interface CelebritySoulsCardProps {
  soulId: string;
  onSelect?: (soulId: string) => void;
  onGenerate?: (soulId: string) => void;
  isSelected?: boolean;
}

export const CelebritySoulsCard: React.FC<CelebritySoulsCardProps> = ({
  soulId,
  onSelect,
  onGenerate,
  isSelected = false,
}) => {
  const soul = getCelebritySoul(soulId);
  const [isHovered, setIsHovered] = useState(false);

  if (!soul) return null;

  return (
    <div
      className={`${styles.celebrity_soul_card} ${isSelected ? styles.selected : ''} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect?.(soulId)}
    >
      {/* 照片区域（主体） */}
      <div className={styles.card_photo_section}>
        <img
          src={`https://via.placeholder.com/400x500/f0f0f0/666666?text=${encodeURIComponent(soul.name)}`}
          alt={soul.name}
          className={styles.card_photo}
        />
        {isSelected && (
          <div className={styles.card_selected_badge}>
            <div className={styles.badge_checkmark}>✓</div>
          </div>
        )}
      </div>

      {/* 信息区域 */}
      <div className={styles.card_info_section}>
        {/* 人名 */}
        <div className={styles.card_name}>{soul.nameZh}</div>
        <div className={styles.card_title}>{soul.name}</div>

        {/* 名言 */}
        <div className={styles.card_quote}>
          <div className={styles.quote_text}>"{soul.wisdom[0]}"</div>
        </div>

        {/* 灵魂注入按钮 */}
        <button
          className={styles.btn_inject}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onGenerate?.(soulId);
          }}
        >
          灵魂注入
        </button>
      </div>
    </div>
  );
};

export default CelebritySoulsCard;
