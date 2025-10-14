// 奖惩机制数据（支持加注+1）
// 奖励和惩罚一一对应，一方的奖励就是另一方的惩罚
const rewardPunishPairs = {
  normal: [
    { reward: '对方给你按摩5分钟', punish: '给对方按摩5分钟' },
    { reward: '获得一个甜蜜亲吻', punish: '给对方一个甜蜜亲吻' },
    { reward: '对方满足你一个小愿望', punish: '满足对方一个小愿望' },
    { reward: '免做一次家务', punish: '替对方做一次家务' },
    { reward: '对方喂我吃零食', punish: '喂对方吃零食' },
  ],
  plus: [
    { reward: '对方给你按摩10分钟', punish: '给对方按摩10分钟' },
    { reward: '获得两个甜蜜亲吻', punish: '给对方两个甜蜜亲吻' },
    { reward: '对方满足你两个小愿望', punish: '满足对方两个小愿望' },
    { reward: '免做两次家务', punish: '替对方做两次家务' },
    { reward: '对方喂我吃零食（不限量）', punish: '喂对方吃零食（不限量）' },
  ],
  half: [
    { reward: '对方给你按摩2分钟', punish: '给对方按摩2分钟' },
    { reward: '获得一个轻吻', punish: '给对方一个轻吻' },
    { reward: '对方满足你一个小要求', punish: '满足对方一个小要求' },
    { reward: '免做一次轻松家务', punish: '替对方做一次轻松家务' },
    { reward: '对方喂我吃一小块零食', punish: '喂对方吃一小块零食' },
  ]
};

export { rewardPunishPairs }