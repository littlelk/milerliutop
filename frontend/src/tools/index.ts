import React from 'react';

// 工具定义
export interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: ToolCategory;
  component: () => Promise<{ default: React.ComponentType<unknown> }>;
}

export type ToolCategory = 
  | 'file'        // 文件处理
  | 'media'       // 媒体处理
  | 'security'    // 安全加密
  | 'network'     // 网络工具
  | 'developer'   // 开发工具
  | 'other';      // 其他工具

// 工具分类配置
export const TOOL_CATEGORIES: Record<ToolCategory, { label: string; icon: string; color: string }> = {
  file: { label: '📁 文件处理', icon: 'folder', color: '#3498db' },
  media: { label: '🎨 媒体处理', icon: 'image', color: '#9b59b6' },
  security: { label: '🔒 安全加密', icon: 'shield', color: '#e74c3c' },
  network: { label: '🌐 网络工具', icon: 'globe', color: '#1abc9c' },
  developer: { label: '💻 开发工具', icon: 'code', color: '#34495e' },
  other: { label: '🔧 其他工具', icon: 'tool', color: '#95a5a6' },
};

// 已注册的工具列表
export const REGISTERED_TOOLS: Tool[] = [
  {
    id: 'file-hasher',
    name: '文件哈希修改',
    icon: '🔐',
    description: '修改文件哈希值，不影响媒体展示效果',
    category: 'file',
    component: async () => {
      const module = await import('./FileHasher');
      return { default: module.FileHasher as React.ComponentType<unknown> };
    },
  },
  {
    id: 'image-watermark',
    name: '图片水印工具',
    icon: '⏰',
    description: '为图片添加时间水印，支持拖动位置和自定义样式',
    category: 'media',
    component: async () => {
      const module = await import('./ImageWatermark');
      return { default: module.ImageWatermark as React.ComponentType<unknown> };
    },
  },
];

// 工具注册表
export const TOOL_REGISTRY = REGISTERED_TOOLS.reduce<Record<string, Tool>>((acc, tool) => {
  acc[tool.id] = tool;
  return acc;
}, {} as Record<string, Tool>);
