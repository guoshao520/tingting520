import React, { useState, useRef, useEffect } from 'react'
import './CoupleDicePage.less'
import TopNavBar from '@/components/TopNavBar'
import { useNavigate } from 'react-router-dom'
import { rewardPunishPairs } from './rewards-punishments'

// 骰子点数样式配置
const diceDots = {
  1: [[50, 50]],
  2: [
    [25, 25],
    [75, 75],
  ],
  3: [
    [25, 25],
    [50, 50],
    [75, 75],
  ],
  4: [
    [25, 25],
    [25, 75],
    [75, 25],
    [75, 75],
  ],
  5: [
    [25, 25],
    [25, 75],
    [50, 50],
    [75, 25],
    [75, 75],
  ],
  6: [
    [25, 25],
    [25, 50],
    [25, 75],
    [75, 25],
    [75, 50],
    [75, 75],
  ],
}

const CoupleDicePage = () => {
  const navigate = useNavigate()
  // 游戏阶段：roll1(先投第1个骰子) → bet(双方下注) → roll2(投第2个骰子) → strategy(策略选择) → roll3(投第3个骰子) → result(结果)
  const [gameStage, setGameStage] = useState('roll1')
  const [bets, setBets] = useState({
    player1: {
      betType: null,
      strategy: 'keep', // 默认选择保持不变
      status: 'active',
      isRaised: false,
    },
    player2: {
      betType: null,
      strategy: 'keep', // 默认选择保持不变
      status: 'active',
      isRaised: false,
    },
  })
  const [diceValues, setDiceValues] = useState([0, 0, 0]) // 三个骰子结果
  const [total, setTotal] = useState(0)
  const [results, setResults] = useState({
    player1: { result: null, punishType: null }, // result: 'win'/'lose'; punishType: 'full'/'fullPlus'/'half'/null
    player2: { result: null, punishType: null },
  })
  const [rewardPunish, setRewardPunish] = useState({
    player1: { type: '', content: '' },
    player2: { type: '', content: '' },
  })
  const diceRefs = [useRef(null), useRef(null), useRef(null)]
  const [isReady, setIsReady] = useState(false) // 是否准备好进入下一阶段

  // 检查当前阶段是否准备就绪
  useEffect(() => {
    switch (gameStage) {
      case 'bet':
        setIsReady(!!bets.player1.betType && !!bets.player2.betType)
        break
      case 'strategy':
        // 只要策略不是 null 就视为已选择（默认'keep'也是有效选择）
        const p1Ready = bets.player1.strategy !== null
        const p2Ready = bets.player2.strategy !== null
        setIsReady(p1Ready && p2Ready)
        break
      default:
        setIsReady(false)
    }
  }, [gameStage, bets])

  // 随机生成骰子点数
  const getRandomDice = () => Math.floor(Math.random() * 6) + 1

  // 计算大小和单双（基于最终总点数）
  const calculateFinalResult = (total) => {
    const isBig = total >= 11 && total <= 18
    const isOdd = total % 2 !== 0
    return { isBig, isOdd }
  }

  // 判断玩家输赢（修正逻辑）
  const judgeWinLose = (betType, total) => {
    // 完全基于下注类型和实际结果判断，与是否加注无关
    switch (betType) {
      case 'big':
        return total >= 11 && total <= 18 // 直接用实际点数判断，避免中间变量
      case 'small':
        return total >= 3 && total <= 10
      case 'odd':
        return total % 2 !== 0
      case 'even':
        return total % 2 === 0
      default:
        return false
    }
  }

  // 生成奖惩内容
  const generateRewardPunish = (resultInfo, isPlayer1, pairIndex) => {
    const playerBet = bets[isPlayer1 ? 'player1' : 'player2']

    // 根据结果类型和加注状态选择对应的奖惩对
    let pair
    if (resultInfo.result === 'win') {
      if (playerBet.isRaised) {
        pair = rewardPunishPairs.plus[pairIndex]
      } else {
        pair = rewardPunishPairs.normal[pairIndex]
      }
      return {
        type: 'reward',
        content: pair.reward,
      }
    } else if (resultInfo.result === 'lose') {
      if (resultInfo.punishType === 'half') {
        pair = rewardPunishPairs.half[pairIndex]
      } else if (playerBet.isRaised) {
        pair = rewardPunishPairs.plus[pairIndex]
      } else {
        pair = rewardPunishPairs.normal[pairIndex]
      }
      return {
        type: 'punish',
        content: pair.punish,
      }
    }
    return { type: 'draw', content: '平局！无奖惩' }
    // // 胜利：新增「双方都胜利时无奖励」的判断
    // if (resultInfo.result === 'win') {
    //   // 判断是否双方都胜利（核心新增逻辑）
    //   const isBothWin =
    //     results.player1.result === 'win' && results.player2.result === 'win'
    //   if (isBothWin) {
    //     return { type: 'draw', content: '双方都胜利，无奖励' } // 双方胜利时返回无奖励
    //   }
    //   // 仅单方胜利时，正常按加注状态给奖励
    //   const rewardList = playerBet.isRaised ? rewardsPlus : rewards
    //   return {
    //     type: 'reward',
    //     content: rewardList[Math.floor(Math.random() * rewardList.length)],
    //   }
    // }
    // // 失败逻辑保持不变...
    // if (resultInfo.result === 'lose') {
    //   let punishList = []
    //   if (resultInfo.punishType === 'half') {
    //     punishList = punishments.half
    //   } else if (playerBet.isRaised) {
    //     punishList = punishments.fullPlus
    //   } else {
    //     punishList = punishments.full
    //   }
    //   return {
    //     type: 'punish',
    //     content: punishList[Math.floor(Math.random() * punishList.length)],
    //   }
    // }
    // // 平局逻辑保持不变...
    // return { type: 'draw', content: '平局！无奖惩' }
  }

  // 结算最终结果
  const calculateSettlement = (finalTotal) => {
    const settlementResult = { player1: {}, player2: {} }

    // 先计算各自的初始结果
    const p1InitialWin = judgeWinLose(bets.player1.betType, finalTotal)
    const p2InitialWin = judgeWinLose(bets.player2.betType, finalTotal)

    // 处理双方都赢或都输的情况（抵消为平局）
    if (p1InitialWin === p2InitialWin) {
      settlementResult.player1 = { result: 'draw', punishType: null }
      settlementResult.player2 = { result: 'draw', punishType: null }
      return settlementResult
    }

    // 处理玩家1结果
    if (bets.player1.status === 'surrendered') {
      // 已认输：检查对方是否也认输
      const p2Surrendered = bets.player2.status === 'surrendered'
      settlementResult.player1 = {
        result: p2Surrendered ? 'draw' : 'lose',
        punishType: p2Surrendered ? null : 'half',
      }
    } else {
      const isWin = judgeWinLose(bets.player1.betType, finalTotal)
      settlementResult.player1 = {
        result: isWin ? 'win' : 'lose', // 正确应用判定结果
        punishType: isWin ? null : bets.player1.isRaised ? 'fullPlus' : 'full',
      }
    }

    // 处理玩家2结果
    if (bets.player2.status === 'surrendered') {
      const p1Surrendered = bets.player1.status === 'surrendered'
      settlementResult.player2 = {
        result: p1Surrendered ? 'draw' : 'lose',
        punishType: p1Surrendered ? null : 'half',
      }
    } else {
      const isWin = judgeWinLose(bets.player2.betType, finalTotal)
      settlementResult.player2 = {
        result: isWin ? 'win' : 'lose', // 正确应用判定结果
        punishType: isWin ? null : bets.player2.isRaised ? 'fullPlus' : 'full',
      }
    }

    return settlementResult
  }

  // 投掷骰子（根据当前阶段投掷对应骰子）
  const rollDice = (targetIndex) => {
    // 标记当前投掷的骰子
    const currentRef = diceRefs[targetIndex]
    currentRef.current.classList.add('rolling')

    // 模拟骰子滚动动画后生成结果
    setTimeout(() => {
      const newDiceValues = [...diceValues]
      newDiceValues[targetIndex] = getRandomDice()
      setDiceValues(newDiceValues)

      // 计算当前总点数
      const newTotal = newDiceValues.reduce((a, b) => a + b, 0)
      setTotal(newTotal)

      // 结束动画
      currentRef.current.classList.remove('rolling')
      currentRef.current.classList.add('rolled')

      // 推进到下一阶段
      switch (targetIndex) {
        case 0:
          // 第1个骰子投完→进入下注阶段
          setGameStage('bet')
          break
        case 1:
          // 第2个骰子投完→进入策略选择阶段
          setGameStage('strategy')
          break
        case 2:
          // 第3个骰子投完→先更新状态，再结算结果
          setDiceValues(newDiceValues)
          const newTotal = newDiceValues.reduce((a, b) => a + b, 0)
          setTotal(newTotal)

          // 结束动画
          currentRef.current.classList.remove('rolling')
          currentRef.current.classList.add('rolled')

          // 使用新计算的newTotal直接结算，而不是依赖state中的total
          const finalResults = calculateSettlement(newTotal) // 传递最新的总点数
          setResults(finalResults)

          // 生成一个随机索引，确保双方使用同一对奖惩
          const randomIndex = Math.floor(
            Math.random() * rewardPunishPairs.normal.length
          )

          // 生成奖惩
          setRewardPunish({
            player1: generateRewardPunish(
              finalResults.player1,
              true,
              randomIndex
            ),
            player2: generateRewardPunish(
              finalResults.player2,
              false,
              randomIndex
            ),
          })

          setGameStage('result')
      }
    }, 2500) // 骰子动画时长
  }

  // 玩家操作（下注/选择策略/认输）
  const handlePlayerAction = (player, actionType, value) => {
    if (bets[player].status === 'surrendered') return

    setBets((prev) => {
      const updatedPlayer = { ...prev[player] }

      if (actionType === 'bet') {
        updatedPlayer.betType = updatedPlayer.betType === value ? null : value
      } else if (actionType === 'strategy') {
        updatedPlayer.strategy = value
        // 重置相关状态
        updatedPlayer.isRaised = value === 'raise'
        updatedPlayer.status = value === 'surrender' ? 'surrendered' : 'active'
      }

      return {
        ...prev,
        [player]: updatedPlayer,
      }
    })
  }

  // 进入下一阶段（投骰子/结算）
  const goToNextStage = () => {
    switch (gameStage) {
      case 'bet':
        // 下注完成→投第2个骰子
        rollDice(1)
        break
      case 'strategy':
        // 策略选择完成→投第3个骰子
        rollDice(2)
        break
    }
  }

  // 重新开始游戏
  const restartGame = () => {
    setGameStage('roll1')
    setBets({
      player1: {
        betType: null,
        strategy: 'keep',
        status: 'active',
        isRaised: false,
      },
      player2: {
        betType: null,
        strategy: 'keep',
        status: 'active',
        isRaised: false,
      },
    })
    setDiceValues([0, 0, 0])
    setTotal(0)
    setResults({
      player1: { result: null, punishType: null },
      player2: { result: null, punishType: null },
    })
    // 重置骰子样式
    diceRefs.forEach((ref) => {
      ref.current.classList.remove('rolled', 'rolling')
    })
  }

  // 渲染骰子
  const renderDice = (index) => {
    const value = diceValues[index]
    const isRolling =
      gameStage === `roll${index + 1}` || (gameStage === 'roll1' && index === 0)
    const isRolled = value > 0

    return (
      <div
        ref={diceRefs[index]}
        className={`dice ${isRolling ? 'rolling' : ''} ${
          isRolled ? 'rolled' : ''
        }`}
        style={{
          opacity: !isRolled && gameStage !== `roll${index + 1}` ? 0.5 : 1,
        }}
      >
        {isRolling ? (
          <div className="rolling-indicator">🎲</div>
        ) : isRolled ? (
          <div className="dice-faces">
            {diceDots[value].map(([x, y], dotIndex) => (
              <div
                key={dotIndex}
                className="dice-dot"
                style={{ left: `${x}%`, top: `${y}%` }}
              ></div>
            ))}
          </div>
        ) : (
          <div className="dice-placeholder">?</div>
        )}
      </div>
    )
  }

  // 渲染玩家操作区域
  const renderPlayerAction = (player) => {
    const playerBet = bets[player]
    const isBoy = player === 'player1'

    switch (gameStage) {
      case 'roll1':
        // 投第1个骰子阶段：显示等待提示
        return (
          <div className="waiting-status">
            <div className="loader"></div>
            <p>正在投掷第1个骰子...</p>
          </div>
        )
      case 'bet':
        // 下注阶段：选择大小/单双
        return (
          <div className="bet-options">
            <p>选择下注类型：</p>
            <div className="bet-buttons">
              <button
                className={`bet-btn ${
                  playerBet.betType === 'big' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'bet', 'big')}
              >
                大 (11-18)
              </button>
              <button
                className={`bet-btn ${
                  playerBet.betType === 'small' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'bet', 'small')}
              >
                小 (3-10)
              </button>
              <button
                className={`bet-btn ${
                  playerBet.betType === 'odd' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'bet', 'odd')}
              >
                单
              </button>
              <button
                className={`bet-btn ${
                  playerBet.betType === 'even' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'bet', 'even')}
              >
                双
              </button>
            </div>
            {/* 显示已投的第1个骰子点数 */}
            <div className="rolled-dice-tip">
              <p>
                已投点数：<span className="dice-value">{diceValues[0]}</span>
              </p>
            </div>
          </div>
        )
      case 'roll2':
        // 投第2个骰子阶段：显示等待提示
        return (
          <div className="waiting-status">
            <div className="loader"></div>
            <p>正在投掷第2个骰子...</p>
            <div className="rolled-dice-tip">
              <p>已投点数：{diceValues[0]} + ?</p>
            </div>
          </div>
        )
      case 'strategy':
        // 策略选择阶段：加注/不变/认输
        if (playerBet.status === 'surrendered') {
          return (
            <div className="surrender-status">
              <p>已认输</p>
              <p className="surrender-tip">（若对方输，你无需惩罚）</p>
            </div>
          )
        }

        // 获取玩家当前下注类型的文本描述
        const betTypeText =
          {
            big: '大 (11-18)',
            small: '小 (3-10)',
            odd: '单',
            even: '双',
          }[playerBet.betType] || '未下注'

        return (
          <div className="strategy-options">
            <div className="current-bet-indicator">
              <span className="indicator-label">当前下注：</span>
              <span className="indicator-value">{betTypeText}</span>
            </div>
            <p>选择策略（基于前2个骰子）：</p>
            <div className="strategy-buttons">
              <button
                className={`strategy-btn raise-btn ${
                  playerBet.strategy === 'raise' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'strategy', 'raise')}
              >
                加注（奖惩+1）
              </button>
              <button
                className={`strategy-btn keep-btn ${
                  playerBet.strategy === 'keep' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'strategy', 'keep')}
              >
                保持不变
              </button>
              <button
                className={`strategy-btn surrender-btn ${
                  playerBet.strategy === 'surrender' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() =>
                  handlePlayerAction(player, 'strategy', 'surrender')
                }
              >
                认输（输一半）
              </button>
            </div>
            {/* 显示已投的前2个骰子点数 */}
            <div className="rolled-dice-tip">
              <p>
                已投点数：{diceValues[0]} + {diceValues[1]} ={' '}
                <span className="total-value">
                  {diceValues[0] + diceValues[1]}
                </span>
              </p>
            </div>
          </div>
        )
      case 'roll3':
        // 投第3个骰子阶段：显示等待提示
        return (
          <div className="waiting-status">
            <div className="loader"></div>
            <p>正在投掷第3个骰子...</p>
            <div className="rolled-dice-tip">
              <p>
                已投点数：{diceValues[0]} + {diceValues[1]} + ?
              </p>
            </div>
          </div>
        )
      case 'result':
        // 结果阶段：显示奖惩
        const playerResult = results[player]
        const playerReward = rewardPunish[player]
        // 获取玩家下注类型的文本描述（复用之前的逻辑）
        const betTypeResultText =
          {
            big: '大 (11-18)',
            small: '小 (3-10)',
            odd: '单',
            even: '双',
          }[playerBet.betType] || '未下注'

        return (
          <div className={`outcome ${playerReward.type}`}>
            <div className="outcome-header">
              {playerResult.result === 'win' && (
                <span className="win-icon">✓</span>
              )}
              {playerResult.result === 'lose' && (
                <span className="lose-icon">✗</span>
              )}
              {playerResult.result === 'draw' && (
                <span className="draw-icon">≈</span>
              )}
              <h4>
                {playerResult.result === 'win'
                  ? '胜利'
                  : playerResult.result === 'lose'
                  ? '失败'
                  : '平局'}
              </h4>
              <span className="bet-type-tag">下注：{betTypeResultText}</span>
              {playerResult.punishType === 'half' && (
                <span className="half-tag">（输一半）</span>
              )}
              {playerBet.isRaised && playerResult.result !== 'draw' && (
                <span className="raise-tag">（已加注）</span>
              )}
            </div>
            <div className="outcome-content">{playerReward.content}</div>
          </div>
        )
      default:
        return null
    }
  }

  // 页面加载完成后自动投掷第1个骰子
  useEffect(() => {
    if (gameStage === 'roll1') {
      rollDice(0)
    }
  }, [gameStage])

  return (
    <div className="couple-dice-container">
      {/* 顶部导航栏 */}
      <TopNavBar title={'情侣骰子对战'} />

      {/* 游戏规则提示 */}
      {/* <div className="game-rules">
        <h4>🎮 游戏规则</h4>
        <ul>
          <li>1. 系统会先投掷1个骰子，后双方进行下注（大小/单双）</li>
          <li>
            2. 投掷第2个骰子后，可选择：加注（奖惩+1）/ 保持不变 /
            认输（输一半）
          </li>
          <li>3. 认输后若对方最终失败，你无需接受惩罚</li>
          <li>
            4. 总点数 11-18 为「大」，3-10
            为「小」；点数和为奇数/偶数对应「单/双」
          </li>
        </ul>
      </div> */}

      {/* 主体内容区 */}
      <div className="dice-content">
        {/* 游戏阶段标题 */}
        <div className="stage-title">
          <h2>
            {gameStage === 'roll1' && '第1步：投掷初始骰子'}
            {gameStage === 'bet' && '第2步：双方下注（大小/单双）'}
            {gameStage === 'roll2' && '第3步：投掷第2个骰子'}
            {gameStage === 'strategy' && '第4步：选择策略（加注/不变/认输）'}
            {gameStage === 'roll3' && '第5步：投掷最后1个骰子'}
            {gameStage === 'result' && '最终结果'}
          </h2>
          {total > 0 && gameStage !== 'result' && (
            <p className="current-total">当前累计：{total}</p>
          )}
        </div>

        {/* 骰子区域 */}
        <div className="dice-area">
          {/* 骰子容器 */}
          <div className="dice-container">
            {renderDice(0)}
            {renderDice(1)}
            {renderDice(2)}
          </div>

          {/* 阶段操作按钮（下注完成/策略选择完成后显示） */}
          {(gameStage === 'bet' || gameStage === 'strategy') && isReady && (
            <button className="next-stage-btn" onClick={goToNextStage}>
              {gameStage === 'bet'
                ? '下注完成，投掷第2个骰子'
                : '策略选择完成，投掷最后1个骰子'}
            </button>
          )}

          {/* 最终结果汇总（仅结果阶段显示） */}
          {gameStage === 'result' && (
            <div className="final-result">
              <h3>🎯 最终结算</h3>
              <div className="dice-summary">
                <p>
                  骰子点数：{diceValues[0]} + {diceValues[1]} + {diceValues[2]}{' '}
                  = <span className="total-highlight">{total}</span>
                </p>
                <p>
                  结果判定：{total >= 11 && total <= 18 ? '大' : '小'} |{' '}
                  {total % 2 !== 0 ? '单' : '双'}
                </p>
              </div>
              <button className="restart-btn" onClick={restartGame}>
                再来一局
              </button>
            </div>
          )}
        </div>

        {/* 玩家区域 */}
        <div className="players-container">
          {/* 玩家1（Boy） */}
          <div
            className={`player-card ${
              results.player1.result === 'win'
                ? 'winner'
                : results.player1.result === 'lose'
                ? 'loser'
                : ''
            } ${
              bets.player1.status === 'surrendered' ? 'surrendered-card' : ''
            }`}
          >
            <div className="player-header">
              <div className="player-avatar boy-avatar">👦</div>
              <h3>Boy</h3>
              {bets.player1.status === 'surrendered' && (
                <span className="surrender-badge">已认输</span>
              )}
            </div>

            {/* 玩家操作/结果区 */}
            {renderPlayerAction('player1')}
          </div>

          {/* 玩家2（Girl） */}
          <div
            className={`player-card ${
              results.player2.result === 'win'
                ? 'winner'
                : results.player2.result === 'lose'
                ? 'loser'
                : ''
            } ${
              bets.player2.status === 'surrendered' ? 'surrendered-card' : ''
            }`}
          >
            <div className="player-header">
              <div className="player-avatar girl-avatar">👧</div>
              <h3>Girl</h3>
              {bets.player2.status === 'surrendered' && (
                <span className="surrender-badge">已认输</span>
              )}
            </div>

            {/* 玩家操作/结果区 */}
            {renderPlayerAction('player2')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoupleDicePage
