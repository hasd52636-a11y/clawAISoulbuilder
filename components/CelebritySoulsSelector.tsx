/**
 * Celebrity Souls Selector Component
 * 名人数字灵魂库选择器
 * 
 * 用户可以选择 5 个名人灵魂之一，一键生成完整的 Agent 配置
 */

import React, { useState } from 'react';
import { 
  listCelebritySouls, 
  getCelebritySoul,
  convertSoulToAgentConfig 
} from '../utils/celebritySoulsSystem';
import { generateAllTemplates } from '../utils/agentTemplateGenerator';

interface CelebritySoulsSelectorProps {
  onSelect?: (soulId: string) => void;
  onGenerate?: (templates: Record<string, string>) => void;
}

export const CelebritySoulsSelector: React.FC<CelebritySoulsSelectorProps> = ({
  onSelect,
  onGenerate,
}) => {
  const [selectedSoul, setSelectedSoul] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const souls = listCelebritySouls();

  const handleSelectSoul = (soulId: string) => {
    setSelectedSoul(soulId);
    onSelect?.(soulId);
  };

  const handleGenerate = async () => {
    if (!selectedSoul) return;

    setIsGenerating(true);
    try {
      const soul = getCelebritySoul(selectedSoul);
      if (!soul) throw new Error('Soul not found');

      const config = convertSoulToAgentConfig(soul);
      const templates = generateAllTemplates(config);

      onGenerate?.(templates);
    } catch (error) {
      console.error('Failed to generate templates:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="celebrity-souls-selector">
      <div className="selector-header">
        <h2>🌟 名人数字灵魂库</h2>
        <p>选择世界顶级企业家的思维模式，一键生成完整 Agent 配置</p>
      </div>

      <div className="souls-grid">
        {souls.map((soul) => (
          <div
            key={soul.id}
            className={`soul-card ${selectedSoul === soul.id ? 'selected' : ''}`}
            onClick={() => handleSelectSoul(soul.id)}
          >
            <div className="soul-icon">
              {soul.id === 'musk' && '⚡'}
              {soul.id === 'bezos' && '🏗️'}
              {soul.id === 'huang' && '🔬'}
              {soul.id === 'grove' && '⚔️'}
              {soul.id === 'nadella' && '🌱'}
            </div>
            <div className="soul-name">{soul.nameZh}</div>
            <div className="soul-archetype">{soul.archetype}</div>
            <div className="soul-description">{soul.description}</div>
          </div>
        ))}
      </div>

      {selectedSoul && (
        <div className="soul-details">
          <SoulDetailsPanel soulId={selectedSoul} />
        </div>
      )}

      <div className="selector-actions">
        <button
          className="btn-generate"
          onClick={handleGenerate}
          disabled={!selectedSoul || isGenerating}
        >
          {isGenerating ? '生成中...' : '🚀 一键生成'}
        </button>
      </div>
    </div>
  );
};

interface SoulDetailsPanelProps {
  soulId: string;
}

const SoulDetailsPanel: React.FC<SoulDetailsPanelProps> = ({ soulId }) => {
  const soul = getCelebritySoul(soulId);

  if (!soul) return null;

  return (
    <div className="soul-details-panel">
      <div className="details-section">
        <h3>🎯 核心特质</h3>
        <ul>
          {soul.personality.traits.map((trait, idx) => (
            <li key={idx}>{trait}</li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h3>💬 语言风格</h3>
        <p className="tone">{soul.languageStyle.tone}</p>
        <div className="catchphrases">
          {soul.catchphrases.slice(0, 3).map((phrase, idx) => (
            <span key={idx} className="catchphrase">
              "{phrase}"
            </span>
          ))}
        </div>
      </div>

      <div className="details-section">
        <h3>⚙️ 推荐工具</h3>
        <ul>
          {soul.toolsRecommendation.map((tool, idx) => (
            <li key={idx}>{tool}</li>
          ))}
        </ul>
      </div>

      <div className="details-section">
        <h3>💡 至理名言</h3>
        <blockquote>{soul.wisdom[0]}</blockquote>
      </div>
    </div>
  );
};

// Styles (CSS-in-JS or separate CSS file)
const styles = `
.celebrity-souls-selector {
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.selector-header {
  text-align: center;
  margin-bottom: 2rem;
}

.selector-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.selector-header p {
  font-size: 1rem;
  opacity: 0.9;
}

.souls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.soul-card {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.soul-card:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-4px);
}

.soul-card.selected {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.soul-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.soul-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.soul-archetype {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-bottom: 0.5rem;
}

.soul-description {
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1.4;
}

.soul-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.soul-details-panel {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.details-section {
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  padding: 1rem;
  border-radius: 4px;
}

.details-section h3 {
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.details-section ul {
  list-style: none;
  padding: 0;
}

.details-section li {
  padding: 0.25rem 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.details-section li:before {
  content: "✓ ";
  margin-right: 0.5rem;
  color: #4ade80;
}

.tone {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 0.75rem;
}

.catchphrases {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.catchphrase {
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-style: italic;
}

blockquote {
  border-left: 3px solid rgba(255, 255, 255, 0.3);
  padding-left: 1rem;
  font-style: italic;
  opacity: 0.9;
  margin: 0;
}

.selector-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-generate {
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-generate:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.4);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;

export default CelebritySoulsSelector;
