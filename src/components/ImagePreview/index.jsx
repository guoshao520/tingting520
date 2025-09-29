import { useState } from 'react'
import { Image } from 'antd-mobile'
import { ImageViewer } from 'antd-mobile' // 注意导入路径（不同版本可能有差异）

// 图片预览组组件
const ImagePreview = ({
  imageList, // 图片地址数组（必传）
  width = 100, // 缩略图宽度
  height = 100, // 缩略图高度
  style = {}, // 缩略图自定义样式
}) => {
  const [visible, setVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  // 点击缩略图触发预览
  const handleThumbClick = (index) => {
    setCurrentIndex(index)
    setVisible(true)
  }

  // 关闭预览
  const handleClose = () => {
    setVisible(false)
  }

  return (
    <>
      {/* 缩略图列表 */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        {imageList.map((src, index) => (
          <Image
            key={index}
            src={src}
            onClick={() => handleThumbClick(index)}
            style={{
              width: width,
              height: height,
              objectFit: 'cover',
              ...style, // 合并自定义样式
            }}
            alt={`预览图片 ${index + 1}`}
          />
        ))}
      </div>

      {/* 预览弹窗 */}
      <ImageViewer.Multi
        visible={visible}
        images={imageList}
        defaultIndex={currentIndex} // 初始显示当前点击的图片
        onClose={handleClose}
        closeOnMaskClick={true} // 点击蒙层关闭（默认true）
      />
    </>
  )
}

export default ImagePreview
