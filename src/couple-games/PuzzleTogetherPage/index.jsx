import React, { useState, useEffect, useRef } from 'react';
import './PuzzleTogetherPage.less';
import TopNavBar from '@/components/TopNavBar';
import EmptyState from '@/components/EmptyState';
import { useNavigate } from 'react-router-dom';
import photos from '@/api/photos'; // 照片列表接口
import photo_category from '@/api/photo_category'; // 分类列表接口
import { getImgUrl } from '@/utils'

// 爱心图标组件
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
);

const CouplePuzzle = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('category'); // category/photo/playing/complete
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [categoryPhotos, setCategoryPhotos] = useState([]); 
  const [selectedPhoto, setSelectedPhoto] = useState(null); 

  // 游戏核心状态（无修改）
  const [puzzleLayout, setPuzzleLayout] = useState([]);
  const [emptyPos, setEmptyPos] = useState(8);
  const [currentTurn, setCurrentTurn] = useState('boy');
  const [completed, setCompleted] = useState(0);
  const [lovePoints, setLovePoints] = useState(0);
  const [timer, setTimer] = useState(0);
  const [lastMoved, setLastMoved] = useState(-1);
  const [loading, setLoading] = useState(false); 

  const puzzleRef = useRef(null);
  const puzzleSize = 3;
  const totalPieces = puzzleSize * puzzleSize;

  // 1. 加载分类列表（无修改）
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await photo_category.list();
        setCategories(data || []);
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    };

    if (stage === 'category') {
      loadCategories();
    }
  }, [stage]);

  // 2. 加载选中分类下的照片（无修改）
  useEffect(() => {
    const loadPhotosByCategory = async () => {
      if (!selectedCategory) return;
      
      setLoading(true);
      try {
        const { data } = await photos.list({ category_id: selectedCategory.id });
        setCategoryPhotos(data?.rows || []);
        console.log("data?.rows?.map(v => v.image_url", data?.rows?.map(v => v.image_url))
      } catch (error) {
        console.error('加载照片失败:', error);
      } finally {
        setLoading(false);
      }
    };

    if (stage === 'photo' && selectedCategory) {
      loadPhotosByCategory();
    }
  }, [stage, selectedCategory]);

  // 选择分类后进入照片选择页（无修改）
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStage('photo');
  };

  // 选择照片后初始化游戏（无修改）
  const handlePhotoSelect = (photo = null) => {
    const targetPhoto = photo || categoryPhotos[Math.floor(Math.random() * categoryPhotos.length)];
    setSelectedPhoto(targetPhoto);
    initPuzzle(targetPhoto);
  };

  // 初始化拼图（无修改）
  const initPuzzle = (photo) => {
    const baseLayout = Array.from({ length: totalPieces }, (_, i) => i);
    let shuffled = [...baseLayout];
    
    for (let i = 0; i < 20; i++) {
      const randomPos = Math.floor(Math.random() * (totalPieces - 1));
      [shuffled[randomPos], shuffled[emptyPos]] = [shuffled[emptyPos], shuffled[randomPos]];
    }
    
    setPuzzleLayout(shuffled);
    setEmptyPos(shuffled.indexOf(8));
    setCompleted(calculateCompleted(shuffled));
    setLovePoints(0);
    setTimer(0);
    setCurrentTurn('boy');
    setStage('playing');
  };

  // 计算已完成碎片（无修改）
  const calculateCompleted = (layout) => {
    return layout.filter((val, idx) => val === idx && val !== 8).length;
  };

  // 检查相邻（无修改）
  const isAdjacent = (pos1, pos2) => {
    const row1 = Math.floor(pos1 / puzzleSize);
    const col1 = pos1 % puzzleSize;
    const row2 = Math.floor(pos2 / puzzleSize);
    const col2 = pos2 % puzzleSize;
    return (Math.abs(row1 - row2) === 1 && col1 === col2) || 
           (Math.abs(col1 - col2) === 1 && row1 === row2);
  };

  // 移动碎片（无修改）
  const movePiece = (clickedPos) => {
    if (stage !== 'playing' || clickedPos === emptyPos) return;
    if (!isAdjacent(clickedPos, emptyPos)) return;

    const newLayout = [...puzzleLayout];
    [newLayout[clickedPos], newLayout[emptyPos]] = [newLayout[emptyPos], newLayout[clickedPos]];
    
    setPuzzleLayout(newLayout);
    setLastMoved(clickedPos);
    setEmptyPos(clickedPos);
    setCurrentTurn(prev => prev === 'boy' ? 'girl' : 'boy');
    setLovePoints(prev => prev + 5);

    const newCompleted = calculateCompleted(newLayout);
    setCompleted(newCompleted);
    if (newCompleted === totalPieces - 1) {
      setStage('complete');
      setLovePoints(prev => prev + 50);
    }
  };

  // 计时器（无修改）
  useEffect(() => {
    let timer;
    if (stage === 'playing') {
      timer = setInterval(() => setTimer(prev => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [stage]);

  // 格式化时间（无修改）
  const formatTime = (sec) => {
    const mins = Math.floor(sec / 60);
    const seconds = sec % 60;
    return `${mins}:${seconds.toString().padStart(2, '0')}`;
  };

  // 计算碎片背景位置（无修改）
  const getPieceStyle = (pieceIndex) => {
    if (!selectedPhoto || !puzzleRef.current) return {};
    
    const containerSize = puzzleRef.current.clientWidth;
    const pieceSize = containerSize / puzzleSize;
    
    const row = Math.floor(pieceIndex / puzzleSize);
    const col = pieceIndex % puzzleSize;

    return {
      backgroundImage: `url(${getImgUrl(selectedPhoto.image_url)})`,
      backgroundPosition: `-${col * pieceSize}px -${row * pieceSize}px`,
      backgroundSize: `${containerSize}px ${containerSize}px`,
      backgroundRepeat: 'no-repeat'
    };
  };

  // ---------------------- 新增：上一步/下一步逻辑 ----------------------
  const goPrevStep = () => {
    switch (stage) {
      case 'photo':
        setStage('category'); // 照片页→分类页
        break;
      case 'playing':
        setStage('photo'); // 游戏页→照片页
        break;
      case 'complete':
        setStage('playing'); // 完成页→游戏页
        break;
      default:
        navigate('/couple-games'); // 分类页→返回游戏列表
    }
  };

  const goNextStep = () => {
    switch (stage) {
      case 'category':
        if (selectedCategory) setStage('photo'); // 分类页→照片页（需选中分类）
        break;
      case 'photo':
        if (selectedPhoto || categoryPhotos.length > 0) {
          handlePhotoSelect(); // 照片页→游戏页（选中照片或有照片可随机）
        }
        break;
      case 'playing':
        // 游戏中无"下一步"，可留空或提示完成拼图
        break;
      case 'complete':
        setStage('category'); // 完成页→分类页（重新选择）
        break;
    }
  };

  // 判断按钮是否禁用
  const isPrevDisabled = stage === 'category'; // 分类页禁用上一步
  const isNextDisabled = (
    (stage === 'category' && !selectedCategory) || // 分类页未选分类
    (stage === 'photo' && categoryPhotos.length === 0) || // 照片页无照片
    stage === 'playing' // 游戏中禁用下一步
  );

  return (
    <div className="couple-puzzle">
      <TopNavBar 
        title="情侣拼图" 
        onLeftClick={() => navigate('/couple-games')}
        rightContent={<Heart size={18} color="#ff4d6d" />}
      />

      {/* ---------------------- 原有内容（无修改） ---------------------- */}
      {/* 1. 分类选择页 */}
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
              {Array.isArray(categories) && categories?.map(category => (
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

      {/* 2. 照片选择页 */}
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
                {categoryPhotos.map(photo => (
                  <div 
                    key={photo.id}
                    className="photo-item"
                    onClick={() => handlePhotoSelect(photo)}
                  >
                    <img src={getImgUrl(photo.image_url)} alt={photo.name} />
                    <span className="photo-name">{photo.name}</span>
                  </div>
                ))}
              </div>
              
              <button 
                className="random-photo-btn"
                onClick={() => handlePhotoSelect()}
              >
                <Heart size={18} color="#ff4d6d" />
                随机选择一张
              </button>
            </>
          )}
        </div>
      )}

      {/* 3. 游戏界面 */}
      {stage === 'playing' && selectedPhoto && (
        <div className="puzzle-playing">
          <div className="couple-status">
            <div className="player boy">
              <div className="avatar">他</div>
              <div className={`turn-indicator ${currentTurn === 'boy' ? 'active' : ''}`}>
                {currentTurn === 'boy' && '当前回合'}
              </div>
            </div>
            
            <div className="game-stats">
              <div className="stat-item">
                <Heart size={16} color="#ff4d6d" />
                <span>爱心值: {lovePoints}</span>
              </div>
              <div className="stat-item">
                <span>用时: {formatTime(timer)}</span>
              </div>
              <div className="stat-item">
                <span>完成度: {completed}/8</span>
              </div>
            </div>
            
            <div className="player girl">
              <div className={`turn-indicator ${currentTurn === 'girl' ? 'active' : ''}`}>
                {currentTurn === 'girl' && '当前回合'}
              </div>
              <div className="avatar">她</div>
            </div>
          </div>

          <div className="puzzle-area">
            <div className="puzzle-container" ref={puzzleRef}>
              <div className="puzzle-board">
                {puzzleLayout.map((pieceIndex, posIndex) => (
                  <div 
                    key={posIndex}
                    className={`puzzle-piece 
                      ${posIndex === emptyPos ? 'empty' : ''} 
                      ${pieceIndex === posIndex && pieceIndex !== 8 ? 'completed' : ''}
                      ${isAdjacent(posIndex, emptyPos) && posIndex !== emptyPos ? 'movable' : ''}
                      ${lastMoved === posIndex ? 'moved' : ''}
                    `}
                    style={posIndex !== emptyPos ? getPieceStyle(pieceIndex) : {}}
                    onClick={() => movePiece(posIndex)}
                    role="button"
                  >
                    {pieceIndex === posIndex && pieceIndex !== 8 && (
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
              className="love-btn"
              onClick={() => {
                setLovePoints(prev => Math.min(prev + 10, 100));
                const tip = document.createElement('div');
                tip.className = 'cheer-tip';
                tip.textContent = currentTurn === 'boy' ? '给她加油！' : '给你加油！';
                document.body.appendChild(tip);
                setTimeout(() => tip.remove(), 1000);
              }}
            >
              <Heart size={18} color="#fff" />
              给TA加油
            </button>
            <button 
              className="reset-btn" 
              onClick={() => initPuzzle(selectedPhoto)}
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      {/* 4. 完成界面 */}
      {stage === 'complete' && selectedPhoto && (
        <div className="puzzle-complete">
          <div className="confetti"></div>
          
          <div className="complete-card">
            <div className="complete-hearts">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} size={24} color="#ff4d6d" animate />
              ))}
            </div>
            
            <h2>太棒了！你们完成了～</h2>
            
            <div className="completed-image">
              <img src={getImgUrl(selectedPhoto.image_url)} alt="完成的拼图" />
            </div>
            
            <div className="complete-stats">
              <div className="stat-row">
                <span>总用时</span>
                <span>{formatTime(timer)}</span>
              </div>
              <div className="stat-row">
                <span>获得爱心</span>
                <span>{lovePoints} 💖</span>
              </div>
              <div className="stat-row">
                <span>协作默契度</span>
                <span>{Math.min(100, 100 - Math.floor(timer / 2))}%</span>
              </div>
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
                className="save-btn"
                onClick={() => {
                  alert('已保存你们的甜蜜回忆～');
                  navigate('/couple-games');
                }}
              >
                保存回忆
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------- 新增：上一步/下一步按钮 ---------------------- */}
      <div className="step-nav-buttons">
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
          {stage === 'complete' ? '重新选择分类' : '下一步'}
        </button>
      </div>
    </div>
  );
};

export default CouplePuzzle;