import { useState } from 'react';
import { Image } from 'antd-mobile';
import { ImageViewer } from 'antd-mobile';
import withPreviewWrap from './withPreviewWrap'; // 导入高阶组件
import './ImagePreview.less';

// 用高阶组件包装多图预览组件
const WrappedImageViewer = withPreviewWrap(ImageViewer);
const WrappedMultiImageViewer = withPreviewWrap(ImageViewer.Multi);

const ImagePreview = ({ currIndex, image, imageList, style = {} }) => {
  const [visible, setVisible] = useState(false);

  const handleThumbClick = () => {
    setVisible(true);
  };

  const handleClose = () => {
    setTimeout(() => {
      setVisible(false);
    }, 100);
  };

  return (
    <>
      {/* 缩略图 */}
      <Image
        src={image || imageList[currIndex]}
        onClick={handleThumbClick}
        style={{
          objectFit: 'cover',
          ...style,
        }}
      />

      {/* 单图预览：保持原有逻辑 */}
      {visible && image && (
        <WrappedImageViewer
          visible={visible}
          image={image}
          onClose={handleClose}
        />
      )}

      {/* 多图预览：使用高阶组件包装后的版本 */}
      {visible && !image && (
        <WrappedMultiImageViewer
          visible={visible}
          images={imageList}
          defaultIndex={currIndex}
          onClose={handleClose}
        />
      )}
    </>
  );
};

export default ImagePreview;
