import { useState } from 'react'
import { Image } from 'antd-mobile'
import { ImageViewer } from 'antd-mobile' // 注意导入路径（不同版本可能有差异）

// 图片预览组组件
const ImagePreview = ({
  currIndex, // 当前图片索引
  image, // 单张图片
  imageList, // 图片地址数组
  style = {}, // 缩略图自定义样式
}) => {
  const [visible, setVisible] = useState(false)

  // 点击缩略图触发预览
  const handleThumbClick = () => {
    setVisible(true)
  }

  // 关闭预览
  const handleClose = () => {
    setVisible(false)
  }

  return (
    <>
      <Image
        src={image || imageList[currIndex]}
        onClick={() => handleThumbClick()}
        style={{
          objectFit: 'cover',
          ...style, // 合并自定义样式
        }}
      />
      {visible &&
        (image ? (
          <ImageViewer
            visible={visible}
            image={image}
            onClose={handleClose}
            closeOnMaskClick={true}
          />
        ) : (
          <ImageViewer.Multi
            visible={visible}
            images={imageList}
            defaultIndex={currIndex}
            onClose={handleClose}
            closeOnMaskClick={true}
          />
        ))}
    </>
  )
}

export default ImagePreview
