import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaBomb, FaFlag } from 'react-icons/fa';
import './HeartMineCature.less';
import TopNavBar from '@/components/TopNavBar';
import { useNavigate } from 'react-router-dom';

const CoupleGamesPage = () => {
  const timerRef = useRef(null); // 用 ref 存储定时器，避免状态异步问题
  const navigate = useNavigate();
  const difficultyConfig = {
    easy: { rows: 3, cols: 3, mines: 1 },
    normal: { rows: 5, cols: 5, mines: 5 },
    advanced: { rows: 8, cols: 8, mines: 10 },
    hard: { rows: 10, cols: 10, mines: 15 },
  };

  const [difficulty, setDifficulty] = useState('normal');
  const [gridSize, setGridSize] = useState(difficultyConfig.normal);
  const [mineCount, setMineCount] = useState(difficultyConfig.normal.mines);
  const [gameState, setGameState] = useState('ready'); // ready, playing, win, lose
  const [grid, setGrid] = useState([]);
  const [flags, setFlags] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [turn, setTurn] = useState('player1');
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [isFlagMode, setIsFlagMode] = useState(false);

  // 切换难度时更新配置（修复定时器清理问题）
  useEffect(() => {
    const config = difficultyConfig[difficulty];
    setGridSize({ rows: config.rows, cols: config.cols });
    setMineCount(config.mines);

    // 关键修改：切换难度时强制重置游戏状态
    clearInterval(timerInterval);
    setTimerInterval(null);
    setGameState('ready'); // 确保状态同步
  }, [difficulty]);

  // 初始化游戏网格（依赖正确更新）
  useEffect(() => {
    resetGame();
  }, [gridSize, mineCount]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => clearInterval(timerInterval);
  }, [timerInterval]);

  // 重置游戏（完善状态重置）
  const resetGame = () => {
    // 强制清理当前定时器（同步操作）
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimer(0);
    setGameState('ready');
    setFlags(0);
    setRevealed(0);
    setTurn('player1');
    setIsFlagMode(false);

    // 以下网格初始化逻辑不变...
    const newGrid = Array(gridSize.rows)
      .fill()
      .map((_, row) =>
        Array(gridSize.cols)
          .fill()
          .map((_, col) => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            adjacentMines: 0,
            row,
            col,
            revealedBy: null,
          }))
      );

    let minesPlaced = 0;
    const minePositions = new Set();
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * gridSize.rows);
      const col = Math.floor(Math.random() * gridSize.cols);
      const key = `${row}-${col}`;
      if (!minePositions.has(key)) {
        minePositions.add(key);
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    const calculateAdjacentMines = (row, col) => {
      let count = 0;
      for (
        let r = Math.max(0, row - 1);
        r <= Math.min(gridSize.rows - 1, row + 1);
        r++
      ) {
        for (
          let c = Math.max(0, col - 1);
          c <= Math.min(gridSize.cols - 1, col + 1);
          c++
        ) {
          if ((r !== row || c !== col) && newGrid[r][c].isMine) {
            count++;
          }
        }
      }
      return count;
    };

    newGrid.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        if (!cell.isMine) {
          newGrid[rowIdx][colIdx].adjacentMines = calculateAdjacentMines(
            rowIdx,
            colIdx
          );
        }
      });
    });

    setGrid(newGrid);
  };

  // 开始计时（确保只创建一个定时器）
  const startTimer = () => {
    if (gameState === 'ready') {
      setGameState('playing');
      // 清理旧定时器（同步）
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // 创建新定时器并存储到 ref
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  // 切换玩家回合
  const switchTurn = () => {
    setTurn((prev) => (prev === 'player1' ? 'player2' : 'player1'));
  };

  // 标记地雷
  const toggleFlag = (row, col) => {
    if (gameState !== 'playing' || grid[row][col].isRevealed) return;

    const newGrid = [...grid.map((row) => [...row])];
    const cell = newGrid[row][col];

    if (!cell.isFlagged && flags >= mineCount) return;

    cell.isFlagged = !cell.isFlagged;
    setFlags((prev) => (cell.isFlagged ? prev + 1 : prev - 1));
    setGrid(newGrid);
    switchTurn();
    checkWin();
  };

  // 揭示单元格（修复递归导致的状态更新异常）
  const revealCell = (row, col) => {
    if (gameState === 'win' || gameState === 'lose' || grid[row][col].isFlagged)
      return;

    startTimer();
    const newGrid = JSON.parse(JSON.stringify(grid)); // 深拷贝避免引用问题
    const cell = newGrid[row][col];

    if (cell.isRevealed) return;

    if (cell.isMine) {
      newGrid[row][col].isRevealed = true;
      newGrid[row][col].revealedBy = turn;
      setGrid(newGrid);
      setGameState('lose');
      // 清理定时器（同步）
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // 计算需要揭示的单元格总数（避免递归重复计数）
    let newRevealedCount = revealed;
    const revealQueue = [];

    if (!cell.isRevealed) {
      cell.isRevealed = true;
      cell.revealedBy = turn;
      newRevealedCount++;
      if (cell.adjacentMines === 0) {
        revealQueue.push([row, col]);
      }
    }

    // 用队列替代递归，避免状态更新冲突
    while (revealQueue.length > 0) {
      const [r, c] = revealQueue.shift();

      for (
        let nr = Math.max(0, r - 1);
        nr <= Math.min(gridSize.rows - 1, r + 1);
        nr++
      ) {
        for (
          let nc = Math.max(0, c - 1);
          nc <= Math.min(gridSize.cols - 1, c + 1);
          nc++
        ) {
          const neighbor = newGrid[nr][nc];
          if (!neighbor.isRevealed && !neighbor.isMine && !neighbor.isFlagged) {
            neighbor.isRevealed = true;
            neighbor.revealedBy = turn;
            newRevealedCount++;

            if (neighbor.adjacentMines === 0) {
              revealQueue.push([nr, nc]);
            }
          }
        }
      }
    }

    setGrid(newGrid);
    setRevealed(newRevealedCount);
    switchTurn();
    checkWin(); // 传入最新计数，确保判断准确
  };

  // 单元格点击事件
  const handleCellClick = (row, col) => {
    if (isFlagMode) {
      toggleFlag(row, col);
    } else {
      revealCell(row, col);
    }
  };

  // 检查胜利条件（修复判定逻辑，确保可靠触发）
  const checkWin = () => {
    const correctlyFlaggedMines = grid.reduce(
      (total, row) =>
        total + row.filter((cell) => cell.isFlagged && cell.isMine).length,
      0
    );

    if (correctlyFlaggedMines === mineCount && gameState === 'playing') {
      setGameState('win');
      // 清理定时器（同步）
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // 数字颜色映射
  const numberColors = [
    '',
    '#4A90E2',
    '#5CB85C',
    '#D9534F',
    '#34495E',
    '#D35400',
    '#8E44AD',
    '#2C3E50',
    '#7F8C8D',
  ];

  // 组件卸载时清理（核心修改：用 ref 清理）
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []); // 空依赖，仅卸载时执行

  return (
    <div className="couple-games-container">
      <div className="couple-games-header">
        <TopNavBar title={'心动地雷捕捉计划'} />
      </div>

      <div className="couple-games-content heart-mine-game">
        <div className="game-control">
          <div className="difficulty-select">
            <button
              className={`difficulty-btn ${
                difficulty === 'easy' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('easy')}
              disabled={gameState === 'playing'}
            >
              简单
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === 'normal' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('normal')}
              disabled={gameState === 'playing'}
            >
              普通
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === 'advanced' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('advanced')}
              disabled={gameState === 'playing'}
            >
              进阶
            </button>
            <button
              className={`difficulty-btn ${
                difficulty === 'hard' ? 'active' : ''
              }`}
              onClick={() => setDifficulty('hard')}
              disabled={gameState === 'playing'}
            >
              困难
            </button>
          </div>

          <div className="game-stats">
            <div className="stat-item">
              <span className="stat-label">剩余地雷:</span>
              <span className="stat-value">{mineCount - flags}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">时间:</span>
              <span className="stat-value">{timer}s</span>
            </div>
            <button
              className={`flag-mode-btn ${isFlagMode ? 'active' : ''}`}
              onClick={() => setIsFlagMode(!isFlagMode)}
              disabled={gameState !== 'playing'}
            >
              <FaFlag className="flag-icon" />
              <span>{isFlagMode ? '退出' : '插旗'}</span>
            </button>
          </div>

          <button className="reset-button" onClick={resetGame}>
            重新开始
          </button>
        </div>

        {/* 游戏状态提示（确保胜利提示可靠显示） */}
        {gameState === 'win' && (
          <div className="game-message win-message">
            <FaHeart className="message-icon" />
            <div className="message-content">
              <p>恭喜！你们捕捉了所有心动地雷！</p>
              <p>共用时：{timer}秒</p>
            </div>
          </div>
        )}
        {gameState === 'lose' && (
          <div className="game-message lose-message">
            <FaBomb className="message-icon" />
            <p>哎呀！踩到心动地雷了，再来一次吧~</p>
          </div>
        )}

        <div
          className="game-grid"
          style={{
            gridTemplateRows: `repeat(${gridSize.rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${gridSize.cols}, minmax(0, 1fr))`,
            touchAction: 'manipulation',
          }}
        >
          {grid.map((row, rowIdx) =>
            row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`grid-cell ${cell.isRevealed ? 'revealed' : ''} 
                           ${cell.isFlagged ? 'flagged' : ''}
                           ${cell.revealedBy === 'player1' ? 'player1' : ''}
                           ${cell.revealedBy === 'player2' ? 'player2' : ''}
                           ${
                             gameState === 'lose' && cell.isMine
                               ? 'mine-exploded'
                               : ''
                           }
                           ${
                             isFlagMode && !cell.isRevealed
                               ? 'flag-mode-hover'
                               : ''
                           }`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (gameState === 'playing') toggleFlag(rowIdx, colIdx);
                }}
              >
                {cell.isRevealed && cell.isMine ? (
                  <FaBomb className="mine-icon" />
                ) : cell.isRevealed && cell.adjacentMines > 0 ? (
                  <span style={{ color: numberColors[cell.adjacentMines] }}>
                    {cell.adjacentMines}
                  </span>
                ) : cell.isFlagged ? (
                  <FaHeart className="flag-icon" />
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CoupleGamesPage;
