import { useState, useRef, useCallback, useEffect } from 'react';
import './ImageWatermark.css';

interface Position {
  x: number;
  y: number;
}

export function ImageWatermark() {
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [watermarkPos, setWatermarkPos] = useState<Position>({ x: 50, y: 50 });
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('rgba(0, 0, 0, 0.5)');
  const [iconSize, setIconSize] = useState(32);
  const [isDragging, setIsDragging] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 处理图片选择
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setWatermarkPos({ x: 50, y: 50 });
    }
  }, []);

  // 获取当前时间文本
  const getTimeText = () => {
    const now = new Date();
    return now.toLocaleString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 绘制画布
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !previewUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = previewUrl;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制原图
      ctx.drawImage(img, 0, 0);
      
      // 计算水印位置（百分比转像素）
      const x = (watermarkPos.x / 100) * canvas.width;
      const y = (watermarkPos.y / 100) * canvas.height;
      
      // 绘制闹钟图标和时间文本
      ctx.font = `${fontSize}px Arial`;
      ctx.textBaseline = 'middle';
      
      // 绘制背景
      const text = getTimeText();
      const textWidth = ctx.measureText(text).width;
      const padding = 20;
      const totalWidth = iconSize + padding + textWidth;
      const totalHeight = Math.max(iconSize, fontSize) + padding;
      
      // 背景
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(
        x - totalWidth / 2 - padding / 2,
        y - totalHeight / 2,
        totalWidth + padding,
        totalHeight + 10,
        10
      );
      ctx.fill();
      
      // 绘制闹钟图标（用 Emoji 简化）
      ctx.font = `${iconSize}px Arial`;
      ctx.fillText('⏰', x - totalWidth / 2, y);
      
      // 绘制时间
      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = textColor;
      ctx.fillText(text, x - totalWidth / 2 + iconSize + padding / 2, y);
    };
  }, [previewUrl, watermarkPos, fontSize, textColor, bgColor, iconSize]);

  // 图片加载完成后绘制
  useEffect(() => {
    if (previewUrl) {
      drawCanvas();
    }
  }, [previewUrl, drawCanvas]);

  // 鼠标/触摸事件处理
  const handleMouseDown = () => {
    if (!previewUrl) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    const rect = containerRef.current.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    let y = ((clientY - rect.top) / rect.height) * 100;
    
    // 限制在 0-100 范围内
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    
    setWatermarkPos({ x, y });
    drawCanvas();
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 下载图片
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `watermarked_${image?.name || 'image'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // 刷新时间
  const handleRefreshTime = () => {
    drawCanvas();
  };

  return (
    <div className="image-watermark">
      <h2>🖼️ 图片水印工具</h2>
      
      {/* 上传区域 */}
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="file-input"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="upload-label">
          📷 点击上传图片
        </label>
      </div>
      
      {/* 预览和编辑区域 */}
      {previewUrl && (
        <div className="editor-section">
          {/* 画布预览 */}
          <div 
            className="canvas-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              className="preview-canvas"
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            />
            <div className="drag-hint">
              💡 拖动水印调整位置
            </div>
          </div>
          
          {/* 控制面板 */}
          <div className="controls-panel">
            <h3>⚙️ 水印设置</h3>
            
            <div className="control-group">
              <label>图标大小：{iconSize}px</label>
              <input
                type="range"
                min="16"
                max="64"
                value={iconSize}
                onChange={(e) => {
                  setIconSize(Number(e.target.value));
                  drawCanvas();
                }}
              />
            </div>
            
            <div className="control-group">
              <label>字体大小：{fontSize}px</label>
              <input
                type="range"
                min="16"
                max="96"
                value={fontSize}
                onChange={(e) => {
                  setFontSize(Number(e.target.value));
                  drawCanvas();
                }}
              />
            </div>
            
            <div className="control-group">
              <label>文字颜色</label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  drawCanvas();
                }}
              />
            </div>
            
            <div className="control-group">
              <label>背景颜色</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => {
                  setBgColor(e.target.value);
                  drawCanvas();
                }}
              />
              <span className="color-preview" style={{ backgroundColor: bgColor }}></span>
            </div>
            
            <div className="button-group">
              <button onClick={handleRefreshTime} className="btn-secondary">
                🔄 刷新时间
              </button>
              <button onClick={handleDownload} className="btn-primary">
                ⬇️ 下载图片
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 水印效果预览 */}
      <div className="preview-section">
        <h3>📍 水印位置：{Math.round(watermarkPos.x)}%, {Math.round(watermarkPos.y)}%</h3>
      </div>
    </div>
  );
}
