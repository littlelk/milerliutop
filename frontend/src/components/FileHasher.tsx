import { useState, useCallback } from 'react';
import SparkMD5 from 'spark-md5';
import './FileHasher.css';

interface HashResult {
  originalMD5: string;
  originalSHA256: string;
  newMD5: string;
  newSHA256: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  hiddenDataLength: number;
}

export function FileHasher() {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [modifiedUrl, setModifiedUrl] = useState<string>('');
  const [result, setResult] = useState<HashResult | null>(null);
  const [hiddenData, setHiddenData] = useState<string>('HIDDEN_DATA_' + Date.now());
  const [isProcessing, setIsProcessing] = useState(false);

  // 计算 SHA256
  const calculateSHA256 = async (data: ArrayBuffer): Promise<string> => {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // 计算 MD5
  const calculateMD5 = (data: ArrayBuffer): string => {
    const spark = new SparkMD5.ArrayBuffer();
    spark.append(data);
    return spark.end();
  };

  // 处理文件选择
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setOriginalUrl(URL.createObjectURL(selectedFile));
      setResult(null);
      setModifiedUrl('');
    }
  }, []);

  // 处理隐藏数据变更
  const handleHiddenDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHiddenData(e.target.value);
  };

  // 修改文件并计算新哈希
  const processFile = async () => {
    if (!file) return;

    setIsProcessing(true);

    try {
      // 1. 读取原文件
      const originalBuffer = await file.arrayBuffer();

      // 2. 计算原始哈希
      const originalMD5 = calculateMD5(originalBuffer);
      const originalSHA256 = await calculateSHA256(originalBuffer);

      // 3. 编码隐藏数据
      const encoder = new TextEncoder();
      const hiddenDataBytes = encoder.encode(hiddenData);

      // 4. 合并：原文件 + 隐藏数据
      const newBuffer = new Uint8Array(originalBuffer.byteLength + hiddenDataBytes.length);
      newBuffer.set(new Uint8Array(originalBuffer), 0);
      newBuffer.set(hiddenDataBytes, originalBuffer.byteLength);

      // 5. 计算新哈希
      const newMD5 = calculateMD5(newBuffer.buffer);
      const newSHA256 = await calculateSHA256(newBuffer.buffer);

      // 6. 生成新文件
      const modifiedFile = new File([newBuffer], file.name, { type: file.type });
      setModifiedUrl(URL.createObjectURL(modifiedFile));

      // 7. 显示结果
      setResult({
        originalMD5,
        originalSHA256,
        newMD5,
        newSHA256,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        hiddenDataLength: hiddenDataBytes.length,
      });
    } catch (error) {
      console.error('处理文件失败:', error);
      alert('处理文件失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  // 下载修改后的文件
  const downloadFile = () => {
    if (!modifiedUrl || !file) return;

    const a = document.createElement('a');
    a.href = modifiedUrl;
    a.download = `modified_${file.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // 重新生成随机隐藏数据
  const regenerateHiddenData = () => {
    setHiddenData('HIDDEN_DATA_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  };

  return (
    <div className="file-hasher">
      <h2>🖼️ 文件哈希修改工具</h2>
      
      {/* 上传区域 */}
      <div className="upload-section">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="file-input"
        />
      </div>

      {/* 隐藏数据输入 */}
      {file && (
        <div className="hidden-data-section">
          <label>隐藏数据（不会影响媒体展示）：</label>
          <div className="input-group">
            <input
              type="text"
              value={hiddenData}
              onChange={handleHiddenDataChange}
              className="hidden-data-input"
            />
            <button onClick={regenerateHiddenData} className="btn-secondary">
              🔄 随机生成
            </button>
          </div>
          <button
            onClick={processFile}
            disabled={isProcessing}
            className="btn-primary"
          >
            {isProcessing ? '处理中...' : '🔧 修改文件并计算哈希'}
          </button>
        </div>
      )}

      {/* 结果展示 */}
      {result && (
        <div className="result-section">
          {/* 哈希对比表 */}
          <div className="hash-comparison">
            <h3>🔍 哈希对比</h3>
            <table className="hash-table">
              <thead>
                <tr>
                  <th>算法</th>
                  <th>原始值</th>
                  <th>修改后</th>
                  <th>变化</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>MD5</strong></td>
                  <td className="hash-original">{result.originalMD5}</td>
                  <td className="hash-new">{result.newMD5}</td>
                  <td className="hash-changed">✅ 已变更</td>
                </tr>
                <tr>
                  <td><strong>SHA256</strong></td>
                  <td className="hash-original">{result.originalSHA256}</td>
                  <td className="hash-new">{result.newSHA256}</td>
                  <td className="hash-changed">✅ 已变更</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 文件信息 */}
          <div className="file-info">
            <h3>📁 文件信息</h3>
            <p><strong>文件名：</strong>{result.fileName}</p>
            <p><strong>类型：</strong>{result.fileType}</p>
            <p><strong>原始大小：</strong>{result.fileSize} bytes</p>
            <p><strong>追加数据：</strong>{result.hiddenDataLength} bytes</p>
            <p><strong>新文件大小：</strong>{result.fileSize + result.hiddenDataLength} bytes</p>
          </div>

          {/* 下载按钮 */}
          <div className="download-section">
            <button onClick={downloadFile} className="btn-download">
              ⬇️ 下载修改后的文件
            </button>
          </div>

          {/* 媒体预览对比 */}
          <div className="media-comparison">
            <div className="media-preview">
              <h4>原始文件</h4>
              {result.fileType.startsWith('image/') ? (
                <img src={originalUrl} alt="原始" className="media-img" />
              ) : (
                <video src={originalUrl} controls className="media-video" />
              )}
            </div>
            <div className="media-preview">
              <h4>修改后文件（展示效果不变）</h4>
              {result.fileType.startsWith('image/') ? (
                <img src={modifiedUrl} alt="修改后" className="media-img" />
              ) : (
                <video src={modifiedUrl} controls className="media-video" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
