import React from 'react';
import './PuzzleTogetherPage.less';
import TopNavBar from '@/components/TopNavBar';
import { useNavigate } from 'react-router-dom';

// 仅保留顶部导航的空白界面
const CoupleGamesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="couple-games-container">
      {/* 顶部导航栏（保留完整结构） */}
      <div className="couple-games-header">
        <TopNavBar title={'双人拼图'} />
      </div>

      {/* 页面主体内容（完全空白） */}
      <div className="couple-games-content"></div>
    </div>
  );
};

export default CoupleGamesPage;