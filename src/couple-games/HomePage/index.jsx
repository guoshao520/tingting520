import React, { useState, useEffect } from 'react';
import './HomePage.less';
import TopNavBar from '@/components/TopNavBar';
import { coupleGamesData } from './data'; // 游戏数据单独抽离
import { getLoginInfo } from '@/utils/storage';
import { toastMsg } from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

// 情侣小游戏主界面组件
const CoupleGamesPage = () => {
  const navigate = useNavigate();
  const [hoveredGame, setHoveredGame] = useState(null);
  const [coupleInfo, setCoupleInfo] = useState(null);

  // 初始化：获取情侣信息（判断是否已绑定伴侣，未绑定则提示）
  useEffect(() => {
    const loginInfo = getLoginInfo();
    if (loginInfo?.couple) {
      setCoupleInfo(loginInfo.couple);
    } else {
      toastMsg('请先绑定伴侣，一起开启游戏吧～');
    }
  }, []);

  // 进入游戏逻辑
  const handleEnterGame = (game) => {
    // 未绑定伴侣时阻止进入
    if (!coupleInfo) {
      toastMsg('绑定伴侣后才能一起玩哦～');
      return;
    }
    // 跳转对应游戏页面（根据游戏id路由）
    // navigate(`/couple-games/${game.id}`);
    toastMsg('暂未开放，请耐心等待')
  };

  // 生成游戏卡片渐变背景（复用主题页渐变逻辑，保持风格统一）
  const getGameCardGradient = (game) => 
    `linear-gradient(135deg, ${game.secondaryColor}33 0%, ${game.primaryColor}33 100%)`;

  return (
    <div className="couple-games-container">
      {/* 顶部导航栏（与主题页格式一致） */}
      <div className="couple-games-header">
        <TopNavBar title={'情侣小游戏'} />
      </div>

      {/* 页面主体内容 */}
      <div className="couple-games-content">
        {/* 头部标题区（延续主题页文案风格，突出情感属性） */}
        <div className="games-header">
          <h2>用游戏，拉近距离</h2>
          <p className="subtitle">每款游戏都是一次甜蜜互动的开始</p>
        </div>

        {/* 游戏列表区（卡片式布局，hover/选中效果统一） */}
        <div className="games-gallery">
          {coupleGamesData.map((game) => (
            <div
              key={game.id}
              className="game-item"
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              onClick={() => handleEnterGame(game)}
              style={{
                // hover时显示主题色阴影，与主题页交互逻辑一致
                boxShadow: hoveredGame === game.id 
                  ? `0 12px 32px -8px ${game.primaryColor}40` 
                  : '0 4px 16px rgba(0,0,0,0.05)',
                // 卡片背景渐变（弱透明度，不干扰内容）
                background: getGameCardGradient(game),
                transition: 'all 0.3s ease'
              }}
            >
              {/* 游戏图标/预览图区 */}
              <div className="game-preview">
                <div 
                  className="game-icon"
                  style={{ backgroundColor: `${game.primaryColor}15` }}
                >
                  {game.icon}
                </div>
              </div>

              {/* 游戏信息区 */}
              <div className="game-info">
                <h3 className="game-name" style={{ color: game.primaryColor }}>
                  {game.name}
                </h3>
                <p className="game-desc">
                  {game.desc}
                </p>

                {/* 进入游戏按钮（hover时变色，增强交互） */}
                <div 
                  className="enter-game-btn"
                  style={{ 
                    borderColor: game.primaryColor,
                    color: hoveredGame === game.id ? '#fff' : game.primaryColor,
                    backgroundColor: hoveredGame === game.id ? game.primaryColor : 'transparent'
                  }}
                >
                  开始游戏
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态/提示区（未绑定伴侣时显示） */}
        {!coupleInfo && (
          <div className="games-empty-state">
            <div className="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="18" y1="8" x2="23" y2="13"></line>
                <line x1="23" y1="8" x2="18" y2="13"></line>
              </svg>
            </div>
            <p className="empty-tip">暂无伴侣信息，无法开启双人游戏</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoupleGamesPage;