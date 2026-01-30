import type { Tool } from '../tools';
import { TOOL_CATEGORIES } from '../tools';
import './ToolCard.css';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const category = TOOL_CATEGORIES[tool.category];

  return (
    <div className="tool-card" onClick={() => window.location.href = `/tool/${tool.id}`}>
      <div className="tool-card__icon">{tool.icon}</div>
      <div className="tool-card__info">
        <h3 className="tool-card__name">{tool.name}</h3>
        <p className="tool-card__description">{tool.description}</p>
        <span 
          className="tool-card__category"
          style={{ backgroundColor: category.color + '20', color: category.color }}
        >
          {category.label}
        </span>
      </div>
      <div className="tool-card__arrow">→</div>
    </div>
  );
}
