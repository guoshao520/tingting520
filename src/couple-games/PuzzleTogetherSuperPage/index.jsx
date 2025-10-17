import React, { useState, useEffect, useRef } from 'react'
import './PuzzleTogetherPage.less'
import TopNavBar from '@/components/TopNavBar'
import EmptyState from '@/components/EmptyState'
import ImagePreview from '@/components/ImagePreview'
import { useNavigate } from 'react-router-dom'
import photos from '@/api/photos'
import photo_category from '@/api/photo_category'
import { getImgUrl } from '@/utils'
import { toastMsg } from '@/utils/toast'

const Heart = ({ size = 20, color = '#ff4d6d', animate = false }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={animate ? 'heart-animate' : ''}
  >
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

const CouplePuzzle = () => {
  const navigate = useNavigate()
  const [stage, setStage] = useState('category') // category, photo, difficulty, playing, complete
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [categoryPhotos, setCategoryPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [renderKey, setRenderKey] = useState(0)
  const [puzzleLayout, setPuzzleLayout] = useState([])
  const [emptyPos, setEmptyPos] = useState(8)
  const [currentTurn, setCurrentTurn] = useState('boy')
  const [completed, setCompleted] = useState(0)
  const [lovePoints, setLovePoints] = useState(0)
  const [timer, setTimer] = useState(0)
  const [lastMoved, setLastMoved] = useState(-1)
  const [loading, setLoading] = useState(false)

  const puzzleRef = useRef(null)
  const [puzzleSize, setPuzzleSize] = useState(3) // 初始简单难度3×3
  const [selectedDifficulty, setSelectedDifficulty] = useState({
    name: '简单',
    size: 3,
  })
  const [currentStepCount, setCurrentStepCount] = useState(0)

  // 难度选项配置
  const difficultyOptions = [
    { name: '幼儿', size: 2, desc: '2×2网格' },
    { name: '简单', size: 3, desc: '3×3网格' },
    { name: '普通', size: 4, desc: '4×4网格' },
    { name: '一般', size: 5, desc: '5×5网格' },
    { name: '困难', size: 6, desc: '6×6网格' },
    { name: '地狱', size: 7, desc: '7×7网格' },
  ]

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await photo_category.list()
        setCategories(data || [])
      } catch (error) {
        console.error('加载分类失败:', error)
        toastMsg('加载分类失败，请稍后再试', 'error')
      }
    }
    if (stage === 'category') {
      loadCategories()
    }
  }, [stage])

  // 加载选中分类下的照片
  useEffect(() => {
    const loadCategoriesByCategory = async () => {
      if (!selectedCategory) return
      setLoading(true)
      try {
        const { data } = await photos.list({ category_id: selectedCategory.id })
        setCategoryPhotos(data?.rows || [])
      } catch (error) {
        console.error('加载照片失败:', error)
        toastMsg('加载照片失败，请稍后再试', 'error')
      } finally {
        setLoading(false)
      }
    }
    if (stage === 'photo' && selectedCategory) {
      loadCategoriesByCategory()
    }
  }, [stage, selectedCategory])

  // 游戏计时逻辑
  useEffect(() => {
    let timerInterval
    if (stage === 'playing') {
      timerInterval = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => clearInterval(timerInterval)
  }, [stage])

  // 选择分类后进入照片选择页
  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setStage('photo')
  }

  // 选择照片后进入难度选择页
  const handlePhotoSelect = (photo = null) => {
    const targetPhoto =
      photo || (categoryPhotos.length > 0 ? categoryPhotos[Math.floor(Math.random() * categoryPhotos.length)] : null)
    if (!targetPhoto) {
      toastMsg('暂无照片可用，请选择其他分类', 'warning')
      return
    }
    setSelectedPhoto(targetPhoto)
    setStage('difficulty') // 明确进入难度选择页
  }

  // 切换难度：仅更新选中状态，不直接进入游戏
  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty)
    setPuzzleSize(difficulty.size)
  }

  // 确认难度并开始游戏
  const confirmDifficultyAndStart = () => {
    setRenderKey(prev => prev + 1) // 强制重新渲染
    initPuzzle(selectedPhoto) // 初始化拼图并进入游戏
  }

  // 初始化拼图
  const initPuzzle = (photo) => {
    const totalPieces = puzzleSize * puzzleSize
    const baseLayout = Array.from({ length: totalPieces }, (_, i) => i)
    let shuffled = [...baseLayout]
    let currentEmptyPos = totalPieces - 1

    // 洗牌次数随难度增加
    const shuffleTimes = Math.max(50, totalPieces * 5)
    for (let i = 0; i < shuffleTimes; i++) {
      const adjacentPositions = []
      // 左邻
      if (currentEmptyPos % puzzleSize > 0)
        adjacentPositions.push(currentEmptyPos - 1)
      // 右邻
      if (currentEmptyPos % puzzleSize < puzzleSize - 1)
        adjacentPositions.push(currentEmptyPos + 1)
      // 上邻
      if (Math.floor(currentEmptyPos / puzzleSize) > 0)
        adjacentPositions.push(currentEmptyPos - puzzleSize)
      // 下邻
      if (Math.floor(currentEmptyPos / puzzleSize) < puzzleSize - 1)
        adjacentPositions.push(currentEmptyPos + puzzleSize)

      if (adjacentPositions.length > 0) {
        const randomAdjacentPos =
          adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)]
        // 交换空白块与随机相邻块
        ;[shuffled[currentEmptyPos], shuffled[randomAdjacentPos]] = [
          shuffled[randomAdjacentPos],
          shuffled[currentEmptyPos],
        ]
        currentEmptyPos = randomAdjacentPos
      }
    }

    // 重置游戏状态并进入游戏
    setPuzzleLayout(shuffled)
    setEmptyPos(currentEmptyPos)
    setCompleted(calculateCompleted(shuffled))
    setLovePoints(0)
    setTimer(0)
    setCurrentTurn('boy')
    setCurrentStepCount(0)
    setStage('playing') // 最后才切换到游戏状态
  }

  // 计算已完成的拼图块数
  const calculateCompleted = (layout) => {
    const totalPieces = puzzleSize * puzzleSize
    return layout.filter((val, idx) => val === idx && val !== totalPieces - 1).length
  }

  // 判断点击位置是否与空白块相邻
  const isAdjacent = (pos1, pos2) => {
    const row1 = Math.floor(pos1 / puzzleSize)
    const col1 = pos1 % puzzleSize
    const row2 = Math.floor(pos2 / puzzleSize)
    const col2 = pos2 % puzzleSize
    return (
      (Math.abs(row1 - row2) === 1 && col1 === col2) ||
      (Math.abs(col1 - col2) === 1 && row1 === row2)
    )
  }

  // 移动拼图块逻辑
  const movePiece = (clickedPos) => {
    if (stage !== 'playing' || clickedPos === emptyPos) return
    if (!isAdjacent(clickedPos, emptyPos)) return

    // 复制并更新拼图布局
    const newLayout = [...puzzleLayout]
    ;[newLayout[clickedPos], newLayout[emptyPos]] = [
      newLayout[emptyPos],
      newLayout[clickedPos],
    ]

    // 更新状态
    setPuzzleLayout(newLayout)
    setLastMoved(clickedPos)
    setEmptyPos(clickedPos)
    setLovePoints(prev => prev + 3)

    // 步数计数与回合切换
    const newStepCount = currentStepCount + 1
    setCurrentStepCount(newStepCount)
    if (newStepCount >= 3) {
      setCurrentTurn(prev => prev === 'boy' ? 'girl' : 'boy')
      setCurrentStepCount(0)
    }

    // 检查是否完成拼图
    const newCompleted = calculateCompleted(newLayout)
    setCompleted(newCompleted)
    if (newCompleted === puzzleSize * puzzleSize - 1) {
      setStage('complete')
      setLovePoints(prev => prev + 50)
      toastMsg('拼图完成！获得额外爱心值奖励', 'success')
    }
  }

  // 格式化时间
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60)
    const seconds = sec % 60
    return `${mins}:${seconds.toString().padStart(2, '0')}`
  }

  // 计算单个拼图块的样式
  const getPieceStyle = (pieceIndex) => {
    if (!selectedPhoto || !puzzleRef.current) return {}

    const container = puzzleRef.current
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    const pieceWidth = containerWidth / puzzleSize
    const pieceHeight = containerHeight / puzzleSize

    const row = Math.floor(pieceIndex / puzzleSize)
    const col = pieceIndex % puzzleSize

    return {
      backgroundImage: `url(${getImgUrl(selectedPhoto.image_url)})`,
      backgroundPosition: `-${col * pieceWidth}px -${row * pieceHeight}px`,
      backgroundSize: `${containerWidth}px ${containerHeight}px`,
      backgroundRepeat: 'no-repeat',
      width: '100%',
      height: '100%',
      cursor: 'pointer',
    }
  }

  // 上一步逻辑
  const goPrevStep = () => {
    switch (stage) {
      case 'photo':
        setStage('category')
        break
      case 'difficulty':
        setStage('photo')
        break
      case 'playing':
        setStage('difficulty')
        break
      case 'complete':
        setStage('playing')
        break
      default:
        navigate('/couple-games/home')
    }
  }

  // 下一步逻辑
  const goNextStep = () => {
    switch (stage) {
      case 'category':
        if (selectedCategory) setStage('photo')
        else toastMsg('请先选择一个分类', 'warning')
        break
      case 'photo':
        if (categoryPhotos.length > 0) {
          handlePhotoSelect()
        } else {
          toastMsg('当前分类暂无照片，请选择其他分类', 'warning')
        }
        break
      case 'difficulty':
        confirmDifficultyAndStart() // 难度选择页的下一步是确认并开始游戏
        break
      case 'complete':
        setStage('category')
        break
    }
  }

  // 判断上一步/下一步按钮是否禁用
  const isPrevDisabled = stage === 'category'
  const isNextDisabled = stage === 'playing'

  return (
    <div className="couple-puzzle">
      <TopNavBar title="恋恋拼图" onBack={() => navigate('/couple-games/home')} />

      {/* 分类选择页面 */}
      {stage === 'category' && (
        <div className="category-select">
          <div className="section-title">
            <Heart size={20} color="#ff4d6d" />
            <h2>选择照片分类</h2>
          </div>
          {categories.length === 0 ? (
            <div className="empty-state">加载分类中...</div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => handleCategorySelect(category)}
                >
                  <div className="category-icon">
                    <Heart size={24} color="#ff4d6d" />
                  </div>
                  <h3 className="category-name">{category.name}</h3>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 照片选择页面 */}
      {stage === 'photo' && selectedCategory && (
        <div className="photo-select">
          <div className="section-title">
            <Heart size={20} color="#ff4d6d" />
            <h2>{selectedCategory.name} · 选择照片</h2>
          </div>
          {loading ? (
            <div className="loading-state">加载照片中...</div>
          ) : categoryPhotos.length === 0 ? (
            <EmptyState marginTop={0} />
          ) : (
            <>
              <div className="photos-grid">
                {categoryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="photo-item"
                    onClick={() => handlePhotoSelect(photo)}
                  >
                    {/* <img src={getImgUrl(photo.image_url)} alt={photo.name} /> */}
                    <ImagePreview image={getImgUrl(photo.image_url)} />
                  </div>
                ))}
              </div>
              <button
                className="random-photo-btn"
                onClick={() => handlePhotoSelect()}
              >
                <Heart size={18} color="#ff4d6d" /> 随机选择一张
              </button>
            </>
          )}
        </div>
      )}

      {/* 难度选择页面 - 现在会完整显示并等待确认 */}
      {stage === 'difficulty' && selectedPhoto && (
        <div className="difficulty-select">
          <div className="section-title">
            <Heart size={20} color="#ff4d6d" />
            <h2>选择拼图难度</h2>
          </div>
          <div className="difficulty-grid">
            {difficultyOptions.map((diff) => (
              <div
                key={diff.size}
                className={`difficulty-card ${
                  selectedDifficulty.size === diff.size ? 'active' : ''
                }`}
                onClick={() => handleDifficultySelect(diff)}
              >
                <div className="difficulty-name">{diff.name}</div>
                <div className="difficulty-desc">{diff.desc}</div>
                <div className="difficulty-preview">
                  <div
                    className="grid-preview"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${diff.size}, 1fr)`,
                      gap: '4px',
                      width: '80px',
                      height: '80px',
                    }}
                  >
                    {Array.from({ length: diff.size * diff.size }).map(
                      (_, i) => (
                        <div
                          key={i}
                          className="grid-cell"
                          style={{
                            backgroundColor:
                              i === diff.size * diff.size - 1
                                ? '#f0f0f0'
                                : '#ffccd5',
                            borderRadius: '2px',
                          }}
                        ></div>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 明确的开始游戏按钮，增强用户体验 */}
          {/* <div className="start-game-section" style={{ marginTop: '30px', textAlign: 'center' }}>
            <button
              className="start-game-btn"
              onClick={confirmDifficultyAndStart}
              style={{
                padding: '12px 30px',
                fontSize: '18px',
                backgroundColor: '#ff4d6d',
                color: 'white',
                border: 'none',
                borderRadius: '30px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(255,77,109,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Heart size={20} color="white" /> 开始拼图挑战
            </button>
          </div> */}
        </div>
      )}

      {/* 游戏进行页面 */}
      {stage === 'playing' && selectedPhoto && (
        <div className="puzzle-playing">
          <div className="couple-status">
            <div className="game-stats">
              <div className="stat-item">
                难度: {selectedDifficulty.name}（{puzzleSize}×{puzzleSize}）
              </div>
              <div className="stat-item">用时: {formatTime(timer)}</div>
              <div className="stat-item">
                完成度: {completed}/{puzzleSize * puzzleSize - 1}
              </div>
            </div>
          </div>

          <div className="puzzle-area" key={renderKey}>
            <div className="puzzle-container" ref={puzzleRef}>
              <div
                className="puzzle-board"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${puzzleSize}, 1fr)`,
                  gridTemplateRows: `repeat(${puzzleSize}, 1fr)`,
                  gap: '2px',
                  width: '100%',
                  maxWidth: '600px',
                  aspectRatio: '1/1',
                  margin: '0 auto',
                  background: '#333',
                }}
              >
                {puzzleLayout.map((pieceIndex, posIndex) => (
                  <div
                    key={posIndex}
                    className={`puzzle-piece 
                      ${posIndex === emptyPos ? 'empty' : ''} 
                      ${
                        pieceIndex === posIndex &&
                        pieceIndex !== puzzleSize * puzzleSize - 1
                          ? 'completed'
                          : ''
                      }
                      ${
                        isAdjacent(posIndex, emptyPos) && posIndex !== emptyPos
                          ? 'movable'
                          : ''
                      }
                      ${lastMoved === posIndex ? 'moved' : ''}
                    `}
                    style={posIndex !== emptyPos ? getPieceStyle(pieceIndex) : {}}
                    onClick={() => movePiece(posIndex)}
                    role="button"
                  >
                    {pieceIndex === posIndex &&
                      pieceIndex !== puzzleSize * puzzleSize - 1 && (
                        <div className="completed-heart">
                          <Heart size={16} color="#ff4d6d" />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="interaction-btns">
            <button
              className="reset-btn"
              onClick={() => initPuzzle(selectedPhoto)}
            >
              重新开始
            </button>
            <button
              className="change-difficulty-btn"
              onClick={() => setStage('difficulty')}
            >
              更换难度
            </button>
          </div>
        </div>
      )}

      {/* 游戏完成页面 */}
      {stage === 'complete' && selectedPhoto && (
        <div className="puzzle-complete">
          <div className="confetti"></div>
          <div className="complete-card">
            <h2>太棒了！{selectedDifficulty.name}难度挑战成功～</h2>
            <div className="completed-image">
              <img src={getImgUrl(selectedPhoto.image_url)} alt="完成的拼图" />
            </div>
            <div className="complete-stats">
              <div className="stat-row">
                <span>难度</span>
                <span>
                  {selectedDifficulty.name}（{puzzleSize}×{puzzleSize}）
                </span>
              </div>
              <div className="stat-row">
                <span>总用时</span>
                <span>{formatTime(timer)}</span>
              </div>
              {/* <div className="stat-row">
                <span>完成块数</span>
                <span>{puzzleSize * puzzleSize - 1} 块（含1块空块）</span>
              </div> */}
              {/* <div className="stat-row">
                <span>爱心值</span>
                <span>{lovePoints} 💖</span>
              </div> */}
            </div>
            <div className="complete-actions">
              <button
                className="another-btn"
                onClick={() => setStage('category')}
              >
                换一个分类
              </button>
              <button
                className="same-category-btn"
                onClick={() => handlePhotoSelect()}
              >
                同分类再玩一张
              </button>
              <button
                className="change-difficulty-btn"
                onClick={() => setStage('difficulty')}
              >
                更换难度再玩
              </button>
            </div>
          </div>
        </div>
      )}

      {!(stage === 'complete' && selectedPhoto) && <div className="step-nav-buttons">
        <button
          className="step-prev-btn"
          onClick={goPrevStep}
          disabled={isPrevDisabled}
        >
          上一步
        </button>
        <button
          className="step-next-btn"
          onClick={goNextStep}
          disabled={isNextDisabled}
        >
          {stage === 'difficulty'
            ? '开始游戏'
            : stage === 'complete'
            ? '重新选择分类'
            : '下一步'}
        </button>
      </div>}
    </div>
  )
}

export default CouplePuzzle
    