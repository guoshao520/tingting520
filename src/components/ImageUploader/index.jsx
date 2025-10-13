import React, { useState, useCallback, useEffect } from 'react';
import useUpYunUpload from '@/hooks/useUpYunUpload';
import './ImageUploader.less';
import { getImgUrl } from '@/utils';
import { toastSuccess, toastMsg } from '@/utils/toast';
import { FaTimes } from 'react-icons/fa';

const ImageUploader = ({
  onUploadSuccess,
  onUploadError,
  initialImages = [],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentFile, setCurrentFile] = useState('');

  const { uploadFiles } = useUpYunUpload();

  /**
   * 提取路径中最后一个斜后的名称
   * @param {string} path - 待处理的路径字符串
   * @returns {string} 最后一个/后的名称（若路径以/结尾则返回空字符串）
   */
  function getLastPathName(path) {
    // 处理空路径或非字符串情况
    if (!path || typeof path !== 'string') {
      return '';
    }

    // 移除路径末尾可能存在的连续斜杠
    const trimmedPath = path.replace(/\/+$/, '');

    // 查找最后一个斜杠的位置
    const lastSlashIndex = trimmedPath.lastIndexOf('/');

    // 若没有斜杠，返回完整路径；否则返回斜杠后的部分
    return lastSlashIndex === -1
      ? trimmedPath
      : trimmedPath.slice(lastSlashIndex + 1);
  }

  // 初始化：将外部传入的initialImages（回显图片）合并到已上传列表
  useEffect(() => {
    if (Array.isArray(initialImages) && initialImages.length > 0) {
      // 格式化initialImages为组件内部统一的图片格式（补全缺失字段）
      const formattedInitialImages = initialImages.map((img, index) => ({
        id: img.id || `init-img-${index}`, // 唯一标识（优先用接口返回id，无则自定义）
        name: getLastPathName(img.url), // 图片名称（默认值兜底）
        url: getImgUrl(img.url), // 图片预览地址（必传）
        upyunPath: img.upyunPath || img.image_url, // 又拍云路径/图片地址（适配接口字段）
        isInitial: true, // 标记为初始回显图片（用于区分新上传图片）
      }));
      setUploadedImages(formattedInitialImages);
    }
  }, [initialImages]);

  // 处理拖放事件
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, []);

  // 处理文件选择
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  // 处理图片删除（支持删除回显图和新上传图）
  const handleImageDelete = (imgId) => {
    const updatedImages = uploadedImages.filter((img) => img.id !== imgId);
    setUploadedImages(updatedImages);
    // 同步通知父组件删除后的图片列表
    if (onUploadSuccess) {
      onUploadSuccess(updatedImages);
    }
  };

  // 处理上传的文件
  const handleFiles = useCallback(
    async (files) => {
      setIsUploading(true);
      setUploadProgress(0);
      setCurrentFile('');

      // 进度回调
      const onProgress = (progress, fileIndex, totalFiles, fileName) => {
        setUploadProgress(progress);
        setCurrentFile(`${fileName} (${fileIndex + 1}/${totalFiles})`);
      };

      try {
        const results = await uploadFiles(files, 'photos', onProgress);

        // 处理上传结果
        const successfulUploads = [];
        const errors = [];

        for (let i = 0; i < results.length; i++) {
          const result = results[i];
          const file = files[i];

          if (result.success) {
            // 读取文件生成预览URL
            const imageData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  id: `new-img-${Date.now()}-${i}`, // 新上传图片自定义唯一ID
                  name: file.name,
                  url: e.target.result,
                  upyunPath: result.path,
                  isInitial: false, // 标记为新上传图片
                });
              };
              reader.readAsDataURL(file);
            });

            successfulUploads.push(imageData);
          } else {
            errors.push({
              fileName: file.name,
              error: result.error || '未知错误',
            });
          }
        }

        // 合并：保留原有回显图 + 添加新上传图
        const newUploadedImages = [...uploadedImages, ...successfulUploads];
        setUploadedImages(newUploadedImages);

        // 回调通知父组件（包含回显图+新上传图的完整列表）
        if (newUploadedImages.length > 0 && onUploadSuccess) {
          onUploadSuccess(newUploadedImages);
        }

        // 错误处理
        if (errors.length > 0) {
          if (onUploadError) {
            onUploadError(errors);
          }
          toastSuccess(
            `上传完成：成功${successfulUploads.length}张，失败${errors.length}张`
          );
        } else if (successfulUploads.length > 0) {
          toastSuccess(`成功上传${successfulUploads.length}张图片`);
        }
      } catch (error) {
        console.error('上传过程中出错:', error);
        if (onUploadError) {
          onUploadError([{ error: error.message }]);
        }
        toastMsg('上传失败，请重试');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
        setCurrentFile('');
      }
    },
    [uploadFiles, onUploadSuccess, onUploadError, uploadedImages]
  );

  return (
    <div className="image-uploader">
      {/* 拖放/选择上传区域 */}
      <div
        className={`uploader-dropzone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="dropzone-content">
          <div className="upload-icon">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z"
                fill="#4A90E2"
              />
              <path d="M14 2V8H20" fill="#3D7BC2" />
              <path
                d="M16 13H8V11H16V13ZM16 17H8V15H16V17ZM13 9H8V7H13V9Z"
                fill="white"
              />
            </svg>
          </div>
          <p>拖放照片到这里，或</p>
          <label htmlFor="file-upload" className="upload-button">
            选择照片
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* 上传进度条 */}
      {isUploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p>上传中: {uploadProgress.toFixed(1)}%</p>
          {currentFile && (
            <p className="current-file">当前文件: {currentFile}</p>
          )}
        </div>
      )}

      {/* 已上传/回显图片列表（带删除功能） */}
      {uploadedImages.length > 0 && (
        <div className="uploaded-images">
          <h3>已选择的照片 ({uploadedImages.length}张)</h3>
          <div className="image-grid">
            {uploadedImages.map((image) => (
              <div key={image.id} className="image-item">
                {/* 图片预览 */}
                <div className="image-preview-container">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="image-preview"
                    loading="lazy"
                  />
                  {/* 删除按钮 */}
                  <button
                    className="image-delete-btn"
                    onClick={() => handleImageDelete(image.id)}
                    aria-label={`删除图片${image.name}`}
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                {/* 图片名称（超出省略） */}
                <p className="image-name" title={image.name}>
                  {image.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
