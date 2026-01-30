import { useParams, useNavigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { TOOL_REGISTRY } from '../tools';
import './ToolPage.css';

// 加载状态组件
function Loading() {
  return (
    <div className="tool-loading">
      <div className="tool-loading__spinner"></div>
      <p>加载中...</p>
    </div>
  );
}

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const navigate = useNavigate();
  
  const tool = toolId ? TOOL_REGISTRY[toolId] : null;

  if (!tool) {
    return (
      <div className="tool-page">
        <div className="tool-page__not-found">
          <h2>工具未找到</h2>
          <button onClick={() => navigate('/')}>返回工具箱</button>
        </div>
      </div>
    );
  }

  // 动态加载工具组件
  const ToolComponent = lazy(tool.component);

  return (
    <div className="tool-page">
      {/* 返回按钮 */}
      <button className="tool-page__back" onClick={() => navigate('/')}>
        ← 返回工具箱
      </button>

      {/* 工具头部 */}
      <header className="tool-page__header">
        <span className="tool-page__icon">{tool.icon}</span>
        <div className="tool-page__info">
          <h1>{tool.name}</h1>
          <p>{tool.description}</p>
        </div>
      </header>

      {/* 工具内容 */}
      <div className="tool-page__content">
        <Suspense fallback={<Loading />}>
          <ToolComponent />
        </Suspense>
      </div>
    </div>
  );
}
