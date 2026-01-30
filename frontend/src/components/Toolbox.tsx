import { useState } from 'react';
import type { Tool, ToolCategory } from '../tools';
import { TOOL_CATEGORIES, REGISTERED_TOOLS } from '../tools';
import { ToolCard } from '../components/ToolCard';
import './Toolbox.css';

interface ToolboxProps {
  onSelectTool: (toolId: string) => void;
}

export function Toolbox({ onSelectTool }: ToolboxProps) {
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory | 'all'>('all');

  // 按分类分组工具
  const groupedTools = REGISTERED_TOOLS.reduce<Record<ToolCategory, Tool[]>>((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<ToolCategory, Tool[]>);

  // 过滤工具
  const filteredCategories = selectedCategory === 'all' 
    ? Object.entries(TOOL_CATEGORIES)
    : Object.entries(TOOL_CATEGORIES).filter(([key]) => key === selectedCategory);

  return (
    <div className="toolbox">
      {/* 头部 */}
      <header className="toolbox__header">
        <h1>🧰 工具箱</h1>
        <p>收集各种实用小工具，持续更新中...</p>
      </header>

      {/* 分类筛选 */}
      <div className="toolbox__categories">
        <button
          className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          🏠 全部
        </button>
        {Object.entries(TOOL_CATEGORIES).map(([key, config]) => (
          <button
            key={key}
            className={`category-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key as ToolCategory)}
            style={{ '--category-color': config.color } as React.CSSProperties}
          >
            {config.icon} {config.label.replace(/^[^\s]+\s/, '')}
          </button>
        ))}
      </div>

      {/* 工具列表 */}
      <div className="toolbox__grid">
        {filteredCategories.map(([categoryKey, config]) => {
          const tools = groupedTools[categoryKey as ToolCategory] || [];
          if (tools.length === 0) return null;

          return (
            <div key={categoryKey} className="toolbox__section">
              <h2 className="toolbox__section-title" style={{ color: config.color }}>
                {config.label}
              </h2>
              <div className="toolbox__list">
                {tools.map((tool: Tool) => (
                  <div key={tool.id} onClick={() => onSelectTool(tool.id)}>
                    <ToolCard tool={tool} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {REGISTERED_TOOLS.length === 0 && (
        <div className="toolbox__empty">
          <span className="empty-icon">📭</span>
          <h3>暂无工具</h3>
          <p>敬请期待更多实用工具...</p>
        </div>
      )}
    </div>
  );
}
