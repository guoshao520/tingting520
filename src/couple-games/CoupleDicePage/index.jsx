import React, { useState, useRef, useEffect } from 'react'
import './CoupleDicePage.less'
import TopNavBar from '@/components/TopNavBar'
import { useNavigate } from 'react-router-dom'
import { rewardPunishPairs } from './rewards-punishments'
import debounce from 'lodash/debounce';

// 骰子点数样式配置（保留原配置）
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
  const [gameStage, setGameStage] = useState('rollFirst')
  const [bets, setBets] = useState({
    player1: {
      betType: null,
      strategy: 'keep',
      status: 'active',
      isRaised: false,
      firstDice: 0,
      isFirstBetter: false,
    },
    player2: {
      betType: null,
      strategy: 'keep',
      status: 'active',
      isRaised: false,
      firstDice: 0,
      isFirstBetter: false,
    },
  })
  const [diceValues, setDiceValues] = useState([0, 0, 0, 0])
  const [results, setResults] = useState({
    player1: { result: null, punishType: null },
    player2: { result: null, punishType: null },
  })
  const [rewardPunish, setRewardPunish] = useState({
    player1: { type: '', content: '' },
    player2: { type: '', content: '' },
  })
  const diceRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]
  const [isReady, setIsReady] = useState(false)
  const [firstDiceResult, setFirstDiceResult] = useState({
    valid: false,
    firstBetter: null,
  })

  // ---------------------- 原有核心逻辑保留 ----------------------
  const getValidFirstDice = () => {
    let dice = Math.floor(Math.random() * 6) + 1
    while (dice === 1 || dice === 6) {
      dice = Math.floor(Math.random() * 6) + 1
    }
    return dice
  }

  const rollFirstDice = async () => {
    diceRefs[0].current.classList.add('rolling')
    diceRefs[1].current.classList.add('rolling')

    await new Promise((resolve) => setTimeout(resolve, 2000))

    const p1FirstDice = getValidFirstDice()
    const p2FirstDice = getValidFirstDice()

    const newDiceValues = [...diceValues]
    newDiceValues[0] = p1FirstDice
    newDiceValues[1] = p2FirstDice
    setDiceValues(newDiceValues)

    setBets((prev) => ({
      player1: { ...prev.player1, firstDice: p1FirstDice },
      player2: { ...prev.player2, firstDice: p2FirstDice },
    }))

    diceRefs[0].current.classList.remove('rolling')
    diceRefs[1].current.classList.remove('rolling')
    diceRefs[0].current.classList.add('rolled')
    diceRefs[1].current.classList.add('rolled')

    if (p1FirstDice > p2FirstDice) {
      setFirstDiceResult({ valid: true, firstBetter: 'player1' })
      setBets((prev) => ({
        player1: { ...prev.player1, isFirstBetter: true },
        player2: { ...prev.player2, isFirstBetter: false },
      }))
    } else if (p1FirstDice < p2FirstDice) {
      setFirstDiceResult({ valid: true, firstBetter: 'player2' })
      setBets((prev) => ({
        player1: { ...prev.player1, isFirstBetter: false },
        player2: { ...prev.player2, isFirstBetter: true },
      }))
    } else {
      setTimeout(() => {
        toastMsg('双方首骰相同，正在重新投掷')
        resetFirstDice()
        rollFirstDice()
      }, 1000)
      return
    }

    setGameStage('firstDiceResult')
  }

  const resetFirstDice = () => {
    diceRefs[0].current.classList.remove('rolled', 'rolling')
    diceRefs[1].current.classList.remove('rolled', 'rolling')
    setDiceValues((prev) => [0, prev[2], prev[3], prev[4]])
    setFirstDiceResult({ valid: false, firstBetter: null })
  }

  // ---------------------- 修复1：调整下注阶段就绪判断逻辑（确保后下注者选完后标记就绪） ----------------------
  useEffect(() => {
    switch (gameStage) {
      case 'bet':
        const firstBetter = firstDiceResult.firstBetter
        if (!firstBetter) return // 先下注者未确定时不判断

        const firstBetReady = bets[firstBetter].betType !== null // 先下注者是否完成
        const secondBetter = firstBetter === 'player1' ? 'player2' : 'player1'
        const secondBetReady = bets[secondBetter].betType !== null // 后下注者是否完成

        // 双方都完成才标记就绪（修复核心：等待后下注者操作）
        setIsReady(firstBetReady && secondBetReady)
        break
      case 'strategy':
        const p1Ready = bets.player1.strategy !== null
        const p2Ready = bets.player2.strategy !== null
        setIsReady(p1Ready && p2Ready)
        break
      default:
        setIsReady(false)
    }
  }, [gameStage, bets, firstDiceResult.firstBetter])

  // ---------------------- 原有逻辑保留 ----------------------
  const getRandomDice = () => Math.floor(Math.random() * 6) + 1

  const calculateFinalResult = () => {
    const p1Total = diceValues[0] + diceValues[2] + diceValues[3]
    const p2Total = diceValues[1] + diceValues[2] + diceValues[3]
    return { p1Total, p2Total }
  }

  const judgeWinLose = (betType, playerTotal) => {
    switch (betType) {
      case 'big':
        return playerTotal >= 11 && playerTotal <= 15
      case 'small':
        return playerTotal >= 6 && playerTotal <= 10
      case 'odd':
        return playerTotal % 2 !== 0
      case 'even':
        return playerTotal % 2 === 0
      default:
        return false
    }
  }

  const generateRewardPunish = (resultInfo, isPlayer1, pairIndex) => {
    const playerBet = bets[isPlayer1 ? 'player1' : 'player2']
    let pair
    if (resultInfo.result === 'win') {
      pair = playerBet.isRaised
        ? rewardPunishPairs.plus[pairIndex]
        : rewardPunishPairs.normal[pairIndex]
      return { type: 'reward', content: pair.reward }
    } else if (resultInfo.result === 'lose') {
      if (resultInfo.punishType === 'half') {
        pair = rewardPunishPairs.half[pairIndex]
      } else {
        pair = playerBet.isRaised
          ? rewardPunishPairs.plus[pairIndex]
          : rewardPunishPairs.normal[pairIndex]
      }
      return { type: 'punish', content: pair.punish }
    }
    return { type: 'draw', content: '平局！无奖惩' }
  }

  const calculateSettlement = () => {
    const { p1Total, p2Total } = calculateFinalResult()
    const settlementResult = { player1: {}, player2: {} }

    console.log('p1Total', p1Total)
    console.log('p2Total', p2Total)

    const p1InitialWin = judgeWinLose(bets.player1.betType, p1Total)
    const p2InitialWin = judgeWinLose(bets.player2.betType, p2Total)

    if (p1InitialWin === p2InitialWin) {
      settlementResult.player1 = { result: 'draw', punishType: null }
      settlementResult.player2 = { result: 'draw', punishType: null }
      return settlementResult
    }

    if (bets.player1.status === 'surrendered') {
      const p2Surrendered = bets.player2.status === 'surrendered'
      settlementResult.player1 = {
        result: p2Surrendered ? 'draw' : 'lose',
        punishType: p2Surrendered ? null : 'half',
      }
    } else {
      settlementResult.player1 = {
        result: p1InitialWin ? 'win' : 'lose',
        punishType: p1InitialWin
          ? null
          : bets.player1.isRaised
          ? 'fullPlus'
          : 'full',
      }
    }

    if (bets.player2.status === 'surrendered') {
      const p1Surrendered = bets.player1.status === 'surrendered'
      settlementResult.player2 = {
        result: p1Surrendered ? 'draw' : 'lose',
        punishType: p1Surrendered ? null : 'half',
      }
    } else {
      settlementResult.player2 = {
        result: p2InitialWin ? 'win' : 'lose',
        punishType: p2InitialWin
          ? null
          : bets.player2.isRaised
          ? 'fullPlus'
          : 'full',
      }
    }

    return settlementResult
  }

  const rollNormalDice = (targetIndex) => {
    const currentRef = diceRefs[targetIndex]
    currentRef.current.classList.add('rolling')

    setTimeout(() => {
      const newDiceValues = [...diceValues]
      newDiceValues[targetIndex] = getRandomDice()
      setDiceValues(newDiceValues) // 仅更新骰子状态

      currentRef.current.classList.remove('rolling')
      currentRef.current.classList.add('rolled')

      switch (targetIndex) {
        case 2:
          setGameStage('strategy') // 投第2个骰子→策略阶段
          break
        case 3:
          setGameStage('toCalculate') // 投最后1个骰子→过渡阶段（等待状态更新）
          break
      }
    }, 2500)
  }

  // 过渡阶段结算结果（确保diceValues已更新）
  useEffect(() => {
    if (gameStage === 'toCalculate') {
      const finalResults = calculateSettlement() // 此时用的是最新的diceValues
      setResults(finalResults)
      const randomIndex = Math.floor(
        Math.random() * rewardPunishPairs.normal.length
      )
      setRewardPunish({
        player1: generateRewardPunish(finalResults.player1, true, randomIndex),
        player2: generateRewardPunish(finalResults.player2, false, randomIndex),
      })
      setGameStage('result') // 结算完成→进入结果阶段
    }
  }, [gameStage, diceValues]) // 依赖diceValues，确保状态更新后触发

  const handlePlayerAction = (player, actionType, value) => {
    if (bets[player].status === 'surrendered') return

    setBets((prev) => {
      const updatedPlayer = { ...prev[player] }
      if (actionType === 'bet') {
        updatedPlayer.betType = updatedPlayer.betType === value ? null : value
      } else if (actionType === 'strategy') {
        updatedPlayer.strategy = value
        updatedPlayer.isRaised = value === 'raise'
        updatedPlayer.status = value === 'surrender' ? 'surrendered' : 'active'
      }
      return { ...prev, [player]: updatedPlayer }
    })
  }

  const goToNextStage = () => {
    switch (gameStage) {
      case 'firstDiceResult':
        setGameStage('bet')
        break
      case 'bet':
        rollNormalDice(2)
        break
      case 'strategy':
        rollNormalDice(3)
        break
    }
  }

  const restartGame = () => {
    setGameStage('rollFirst')
    setBets({
      player1: {
        betType: null,
        strategy: 'keep',
        status: 'active',
        isRaised: false,
        firstDice: 0,
        isFirstBetter: false,
      },
      player2: {
        betType: null,
        strategy: 'keep',
        status: 'active',
        isRaised: false,
        firstDice: 0,
        isFirstBetter: false,
      },
    })
    setDiceValues([0, 0, 0, 0])
    setResults({
      player1: { result: null, punishType: null },
      player2: { result: null, punishType: null },
    })
    setFirstDiceResult({ valid: false, firstBetter: null })
    diceRefs.forEach((ref) => ref.current.classList.remove('rolled', 'rolling'))
  }

  // ---------------------- 修复2：渲染骰子保留原逻辑 ----------------------
  const renderDice = (index) => {
    const value = diceValues[index]
    const isRolling =
      (gameStage === 'rollFirst' && (index === 0 || index === 1)) ||
      (gameStage === 'rollSecond' && index === 2) ||
      (gameStage === 'rollThird' && index === 3)
    const isRolled = value > 0
    const isFirstDice = index === 0 || index === 1
    const firstDiceLabel = index === 0 ? 'Boy首骰' : 'Girl首骰'

    return (
      <div className="dice-wrapper" key={index}>
        {isFirstDice && (
          <div className="dice-label">
            {firstDiceLabel}
            {/* {(bets.player1.isFirstBetter && index === 0) || (bets.player2.isFirstBetter && index === 1) ? (
              <span className="first-better-tag"></span>
            ) : null} */}
          </div>
        )}
        <div
          ref={diceRefs[index]}
          className={`dice ${isRolling ? 'rolling' : ''} ${
            isRolled ? 'rolled' : ''
          }`}
          style={{ opacity: !isRolled && !isRolling ? 0.5 : 1 }}
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
      </div>
    )
  }

  // ---------------------- 修复3：核心修复 - 调整下注阶段操作权限逻辑 ----------------------
  const renderPlayerAction = (player) => {
    const playerBet = bets[player]
    const isBoy = player === 'player1'
    const firstBetter = firstDiceResult.firstBetter
    const secondBetter = firstBetter === 'player1' ? 'player2' : 'player1' // 后下注者标识

    switch (gameStage) {
      case 'rollFirst':
        return (
          <div className="waiting-status">
            <div className="loader"></div>
            <p>正在自动投掷首骰（禁1/6）...</p>
          </div>
        )
      case 'firstDiceResult':
        return (
          <div className="first-dice-result">
            <p className="result-label">你的首骰点数：{playerBet.firstDice}</p>
            {/* <div className="first-dice-value">{playerBet.firstDice}</div> */}
            {playerBet.isFirstBetter && (
              <div className="first-better-tip">✨ 你是先下注者！</div>
            )}
            {!playerBet.isFirstBetter && firstBetter !== null && (
              <div className="second-better-tip">
                等待{firstBetter === 'player1' ? 'Boy' : 'Girl'}先下注...
              </div>
            )}
          </div>
        )
      case 'bet':
        // 关键修复：下注权限控制逻辑
        const isFirstBetterReady = bets[firstBetter]?.betType !== null // 先下注者是否已选
        const canBet =
          player === firstBetter ||
          (player === secondBetter && isFirstBetterReady)
        const waitTip =
          player === firstBetter
            ? '请选择下注类型（先下注者）'
            : isFirstBetterReady
            ? '可以选择下注类型啦（后下注者）'
            : `等待${firstBetter === 'player1' ? 'Boy' : 'Girl'}先下注...`

        return (
          <div className="bet-options">
            <p>{waitTip}</p>
            {/* 修复：仅控制透明度，不禁用点击事件（确保后下注者能操作） */}
            <div
              className="bet-buttons"
              style={{
                opacity: canBet ? 1 : 0.6,
                pointerEvents: canBet ? 'auto' : 'none', // 只有能操作时才开放点击
              }}
            >
              <button
                className={`bet-btn ${
                  playerBet.betType === 'big' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'bet', 'big')}
              >
                大 (11-15)
              </button>
              <button
                className={`bet-btn ${
                  playerBet.betType === 'small' ? 'selected' : ''
                }`}
                data-player={isBoy ? 'boy' : 'girl'}
                onClick={() => handlePlayerAction(player, 'bet', 'small')}
              >
                小 (6-10)
              </button>
              {/* <button
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
              </button> */}
            </div>
            {/* 显示双方首骰点数 */}
            <div className="rolled-dice-tip">
              <p>
                双方首骰：{bets.player1.firstDice} (Boy) vs{' '}
                {bets.player2.firstDice} (Girl)
              </p>
            </div>
          </div>
        )
      // 以下阶段保留原逻辑
      case 'rollSecond':
        return (
          <div className="waiting-status">
            <div className="loader"></div>
            <p>正在投掷第2个骰子...</p>
            <div className="rolled-dice-tip">
              <p>已投点数：{playerBet.firstDice} + ?</p>
            </div>
          </div>
        )
      case 'strategy':
        if (playerBet.status === 'surrendered') {
          return (
            <div className="surrender-status">
              <p>已认输</p>
              <p className="surrender-tip">（若对方输，你无需惩罚）</p>
            </div>
          )
        }
        const betTypeText =
          {
            big: '大 (11-15)',
            small: '小 (6-10)',
            odd: '单',
            even: '双',
          }[playerBet.betType] || '未下注'
        return (
          <div className="strategy-options">
            <div className="current-bet-indicator">
              <span className="indicator-label">当前下注：</span>
              <span className="indicator-value">{betTypeText}</span>
            </div>
            <p>选择策略（基于首骰+第2骰）：</p>
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
            <div className="rolled-dice-tip">
              <p>
                已投点数：{playerBet.firstDice} + {diceValues[2]} ={' '}
                <span className="total-value">
                  {playerBet.firstDice + diceValues[2]}
                </span>
              </p>
            </div>
          </div>
        )
      case 'rollThird':
        return (
          <div className="waiting-status">
            <div className="loader"></div>
            <p>正在投掷第3个骰子...</p>
            <div className="rolled-dice-tip">
              <p>
                已投点数：{playerBet.firstDice} + {diceValues[2]} + ?
              </p>
            </div>
          </div>
        )
      case 'result':
        const playerResult = results[player]
        const playerReward = rewardPunish[player]
        const betTypeResultText =
          {
            big: '大 (11-15)',
            small: '小 (6-10)',
            odd: '单',
            even: '双',
          }[playerBet.betType] || '未下注'
        const finalTotal = playerBet.firstDice + diceValues[2] + diceValues[3]
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
              <span className="total-tag">总点数：{finalTotal}</span>
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

  // ---------------------- 原有逻辑保留 ----------------------
  useEffect(() => {
    if (gameStage === 'rollFirst') {
      rollFirstDice()
    }
  }, [gameStage])

  const toastMsg = (msg) => {
    const toast = document.createElement('div')
    toast.className = 'temp-toast'
    toast.textContent = msg
    document.body.appendChild(toast)
    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => document.body.removeChild(toast), 300)
    }, 1500)
  }

  return (
    <div className="couple-dice-container">
      <TopNavBar title={'情侣骰子对战'} />

      {/* <div className="game-rules">
        <h4>🎮 游戏规则</h4>
        <ul>
          <li>1. 系统自动为双方投掷「首骰」（禁1和6），首骰大的先下注</li>
          <li>2. 下注类型：大（11-15）、小（6-10）、单（总点数奇数）、双（总点数偶数）</li>
          <li>3. 先下注者完成选择后，后下注者可选择下注类型</li>
          <li>4. 投掷第2个骰子后，可选择：加注（奖惩+1）/ 保持不变 / 认输（输一半）</li>
          <li>5. 最终总点数 = 你的首骰 + 公共第2骰 + 公共第3骰</li>
        </ul>
        <style>{`
          .temp-toast {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            background: rgba(0,0,0,0.7);
            color: #fff;
            border-radius: 4px;
            z-index: 9999;
            transition: opacity 0.3s;
          }
        `}</style>
      </div> */}

      <div className="dice-content">
        <div className="stage-title">
          <h2>
            {gameStage === 'rollFirst' && '第1步：自动投掷首骰（禁1/6）'}
            {gameStage === 'firstDiceResult' &&
              '第2步：首骰结果（判定先下注者）'}
            {gameStage === 'bet' && '第3步：下注阶段（先下注者优先）'}
            {/* {gameStage === 'rollSecond' && '第4步：投掷第2个骰子'} */}
            {gameStage === 'strategy' && '第4步：选择策略（加注/不变/认输）'}
            {/* {gameStage === 'rollThird' && '第5步：投掷最后1个骰子'} */}
            {gameStage === 'result' && '最终结果'}
          </h2>
          {gameStage === 'result' && (
            <p className="current-total">
              双方总点数：Boy {diceValues[0] + diceValues[2] + diceValues[3]} |
              Girl {diceValues[1] + diceValues[2] + diceValues[3]}
            </p>
          )}
        </div>

        <div className="dice-area">
          <div className="dice-container">
            {renderDice(0)}
            {renderDice(1)}
            {renderDice(2)}
            {renderDice(3)}
          </div>

          {(gameStage === 'firstDiceResult' && firstDiceResult.valid) ||
          (gameStage === 'bet' && isReady) ||
          (gameStage === 'strategy' && isReady) ? (
            <button className="next-stage-btn" onClick={debounce(() => goToNextStage(), 500)}>
              {gameStage === 'firstDiceResult' && '进入下注阶段'}
              {gameStage === 'bet' && '下注完成，投掷第2个骰子'}
              {gameStage === 'strategy' && '策略选择完成，投掷最后1个骰子'}
            </button>
          ) : null}

          {gameStage === 'result' && (
            <div className="final-result">
              <h3>🎯 最终结算</h3>
              <div className="dice-summary">
                <div>
                  骰子点数：
                  <p>
                    Boy首骰 {diceValues[0]} + 第2骰 {diceValues[2]} + 第3骰{' '}
                    {diceValues[3]} ={' '}
                    {diceValues[0] + diceValues[2] + diceValues[3]}{' '}
                  </p>
                  <p>
                    Girl首骰 {diceValues[1]} + 第2骰 {diceValues[2]} + 第3骰{' '}
                    {diceValues[3]} ={' '}
                    {diceValues[1] + diceValues[2] + diceValues[3]}
                  </p>
                </div>
              </div>
              <button className="restart-btn" onClick={restartGame}>
                再来一局
              </button>
            </div>
          )}
        </div>

        <div className="players-container">
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
            {renderPlayerAction('player1')}
          </div>

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
            {renderPlayerAction('player2')}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CoupleDicePage
