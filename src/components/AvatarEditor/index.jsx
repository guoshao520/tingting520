import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import useUpYunUpload from '@/hooks/useUpYunUpload';
import { getImgUrl } from '@/utils';
import { toastSuccess, toastMsg } from '@/utils/toast';
import { FaCamera, FaTimes, FaPencilAlt } from 'react-icons/fa';
import Cropper from 'react-cropper';
import './AvatarEditor.less';
import './Cropper.css';

//  memo 包裹组件，减少不必要的重渲染
const AvatarEditor = memo(({
  onUploadSuccess,
  onUploadError,
  initialAvatar = '',
  avatarSize = 120,
}) => {
  // 状态管理：仅保留必要状态，减少状态更新频率
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('');
  const [showCropper, setShowCropper] = useState(false);
  const [cropImgSrc, setCropImgSrc] = useState('');
  
  // 用 useRef 存储非渲染相关数据（避免状态更新触发重绘）
  const cropperInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const originalBodyOverflowRef = useRef(''); // 存储原始body滚动状态

  const { uploadFiles } = useUpYunUpload();

  // 初始化头像：仅在 initialAvatar 变化时执行
  useEffect(() => {
    if (initialAvatar) {
      setCurrentAvatar(getImgUrl(initialAvatar));
    }
  }, [initialAvatar]);

  // 弹窗显示/隐藏时控制背景滚动：减少DOM操作频率
  useEffect(() => {
    if (showCropper) {
      // 存储原始滚动状态，避免重复读取DOM
      originalBodyOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      // 恢复原始滚动状态，而非固定值
      document.body.style.overflow = originalBodyOverflowRef.current;
    }

    // 组件卸载时强制恢复滚动
    return () => {
      document.body.style.overflow = originalBodyOverflowRef.current;
    };
  }, [showCropper]);

  // -------------------------- 事件处理优化 --------------------------
  // 1. 合并事件逻辑，用 useCallback 缓存函数（避免每次渲染生成新函数）
  // 2. 移除冗余的 stopPropagation，仅在关键节点阻止事件穿透
  const handleDragEvent = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter') {
      setIsDragging(true);
    } else if (e.type === 'dragleave' && e.currentTarget === e.target) {
      setIsDragging(false);
    } else if (e.type === 'drop') {
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length === 1 && files[0].type.startsWith('image/')) {
        handleFileSelect(files[0]);
      } else {
        toastMsg('请上传单张图片文件');
      }
    }
  }, []);

  // 处理文件选择：拆分同步/异步逻辑，减少阻塞
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files.length === 1 && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
      e.target.value = ''; // 重置input，允许重复选择同一文件
    } else {
      toastMsg('请上传单张图片文件');
    }
  }, []);

  // 点击头像触发文件选择：无依赖，缓存函数
  const handleAvatarClick = useCallback(() => {
    if (!isUploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [isUploading]);

  // 处理文件选择（显示裁剪框）：优化FileReader性能
  const handleFileSelect = useCallback((file) => {
    // 1. 先做文件大小校验（同步操作，快速反馈）
    if (file.size > 5 * 1024 * 1024) {
      toastMsg('图片大小不能超过5MB');
      return;
    }

    // 2. 异步读取文件：用createObjectURL替代readAsDataURL（性能更优）
    const imgUrl = URL.createObjectURL(file);
    setCropImgSrc(imgUrl);
    setShowCropper(true);

    // 3. 清理URL，避免内存泄漏
    return () => {
      URL.revokeObjectURL(imgUrl);
    };
  }, []);

  // 取消裁剪：重置状态时清理资源
  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    // 清理裁剪图URL，释放内存
    if (cropImgSrc) {
      URL.revokeObjectURL(cropImgSrc);
      setCropImgSrc('');
    }
    // 重置裁剪实例
    cropperInstanceRef.current = null;
  }, [cropImgSrc]);

  // -------------------------- 裁剪与上传优化 --------------------------
  // 裁剪初始化：用ref存储实例，避免状态更新
  const handleCropperInit = useCallback((instance) => {
    if (instance) {
      cropperInstanceRef.current = instance;
    }
  }, []);

  // 确认裁剪并上传：拆分同步/异步逻辑，减少UI阻塞
  const handleCropConfirm = useCallback(async () => {
    const cropper = cropperInstanceRef.current;
    if (!cropper || isUploading) return;

    // 1. 同步更新上传状态（快速反馈）
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 2. 裁剪图片：用requestAnimationFrame优化canvas绘制
      const croppedCanvas = await new Promise((resolve) => {
        requestAnimationFrame(() => {
          const canvas = cropper.getCroppedCanvas({
            aspectRatio: 1 / 1,
            width: avatarSize * 2,
            height: avatarSize * 2,
            imageSmoothingQuality: 'high', // 高清渲染，避免模糊
          });
          resolve(canvas);
        });
      });

      // 3. 转换为Blob并上传：用canvas.toBlob直接获取Blob（减少中间步骤）
      const croppedBlob = await new Promise((resolve) => {
        croppedCanvas.toBlob(resolve, 'image/png', 0.9);
      });

      if (!croppedBlob) throw new Error('裁剪图片生成失败');

      // 4. 上传文件：进度回调用requestAnimationFrame优化UI更新
      const croppedFile = new File(
        [croppedBlob],
        `avatar-${Date.now()}.png`,
        { type: 'image/png' }
      );

      const onProgress = (progress) => {
        // 用requestAnimationFrame避免频繁更新进度条导致卡顿
        requestAnimationFrame(() => {
          setUploadProgress(progress);
        });
      };

      const [uploadResult] = await uploadFiles([croppedFile], 'avatar', onProgress);

      if (uploadResult.success) {
        const avatarUrl = getImgUrl(uploadResult.path);
        setCurrentAvatar(avatarUrl);
        toastSuccess('头像上传成功');
        onUploadSuccess && onUploadSuccess({ url: avatarUrl, upyunPath: uploadResult.path });
      } else {
        throw new Error(uploadResult.error || '头像上传失败');
      }
    } catch (error) {
      console.error('上传失败:', error);
      onUploadError && onUploadError(error.message);
      toastMsg('上传失败，请重试');
    } finally {
      // 5. 无论成功失败，都清理资源并重置状态
      setIsUploading(false);
      setUploadProgress(0);
      handleCropCancel(); // 复用取消逻辑，减少代码冗余
    }
  }, [isUploading, avatarSize, uploadFiles, onUploadSuccess, onUploadError, handleCropCancel]);

  // 清空头像：阻止事件冒泡（仅一次处理）
  const handleAvatarClear = useCallback((e) => {
    e.stopPropagation();
    setCurrentAvatar('');
    onUploadSuccess && onUploadSuccess({ url: '', upyunPath: '' });
  }, [onUploadSuccess]);

  // -------------------------- 渲染优化：减少DOM节点与重绘 --------------------------
  return (
    <div 
      className="avatar-editor" 
      // 用CSS变量传递尺寸，避免内联样式频繁更新
      // style={{ '--avatar-size': `${avatarSize}px` }}
    >
      {/* 头像预览与上传区：合并事件绑定，减少事件监听数量 */}
      <div
        className={`avatar-preview-container ${isDragging ? 'dragging' : ''} ${
          isUploading ? 'uploading' : ''
        }`}
        onDragEnter={handleDragEvent}
        onDragOver={handleDragEvent}
        onDragLeave={handleDragEvent}
        onDrop={handleDragEvent}
        onClick={handleAvatarClick}
      >
        <div className="avatar-preview">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="当前头像"
              className="avatar-img"
              loading="lazy"
              // 增加图片加载优化，避免布局偏移
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="avatar-placeholder">
              <FaCamera size={avatarSize / 3} />
              <p>点击上传头像</p>
            </div>
          )}

          {/* 编辑提示图标：用CSS控制显示，减少JS状态判断 */}
          <div className="avatar-edit-indicator">
            <FaPencilAlt size={16} />
          </div>

          {/* 清空头像按钮：仅在有头像且未上传时显示 */}
          {currentAvatar && !isUploading && (
            <button
              className="avatar-clear-btn"
              onClick={handleAvatarClear}
              aria-label="清空头像"
              // 禁用时不触发点击，减少事件处理
              disabled={isUploading}
            >
              <FaTimes size={16} />
            </button>
          )}
        </div>

        {/* 隐藏的文件输入框：用ref控制，避免DOM查询 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* 上传进度条：仅在上传中显示，减少DOM节点存在时间 */}
        {isUploading && (
          <div className="avatar-upload-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p>上传中: {uploadProgress.toFixed(1)}%</p>
          </div>
        )}
      </div>

      {/* 裁剪弹窗：用ref控制，减少DOM查询；仅在showCropper为true时渲染 */}
      {showCropper && (
        <div
          ref={modalRef}
          className="avatar-cropper-modal"
          // 仅在弹窗根节点阻止事件，减少内部事件处理
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="cropper-content">
            <div className="cropper-header">
              <h3>裁剪头像（1:1比例）</h3>
              <button
                className="cropper-close-btn"
                onClick={handleCropCancel}
                aria-label="关闭"
                disabled={isUploading}
              >
                <FaTimes />
              </button>
            </div>

            {/* 裁剪组件：优化配置，减少不必要的计算 */}
            <div className="cropper-container">
              <Cropper
                src={cropImgSrc}
                // 用CSS控制尺寸，避免内联样式重绘
                className="cropper-img"
                initialAspectRatio={1}
                aspectRatio={1}
                guides={true}
                viewMode={1}
                minCropBoxWidth={100}
                minCropBoxHeight={100}
                onInitialized={handleCropperInit}
                // 裁剪组件内部事件：仅阻止冒泡，不阻止默认（避免影响裁剪交互）
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                // 关闭不必要的事件监听（如zoom、rotate，减少性能消耗）
                zoomable={false}
                rotatable={false}
                scalable={false}
              />
            </div>

            {/* 裁剪操作按钮：禁用状态用CSS控制，减少JS判断 */}
            <div className="cropper-actions">
              <button
                className="cropper-btn cancel-btn"
                onClick={handleCropCancel}
                disabled={isUploading}
              >
                取消
              </button>
              <button
                className="cropper-btn confirm-btn"
                onClick={handleCropConfirm}
                disabled={isUploading}
              >
                {isUploading ? '上传中...' : '确认上传'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default AvatarEditor;