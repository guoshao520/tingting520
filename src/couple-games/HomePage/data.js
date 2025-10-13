// 仅使用项目已引入过的 Fa 系列图标（避免新增依赖）
import { FaHeart, FaComment, FaImage, FaList, FaCog } from 'react-icons/fa';

// 情侣小游戏数据（用已有图标替换，确保能正常显示）
export const coupleGamesData = [
  {
    id: 'puzzle-together',
    name: '双人拼图',
    desc: '上传你们的合照，一起拼出专属回忆',
    primaryColor: '#FF6B8A',
    secondaryColor: '#FFA7B5',
    icon: <FaImage size={24} style={{ color: '#FF6B8A' }} /> // 用已有FaImage替代拼图图标
  },
  {
    id: 'tacit-test',
    name: '默契大挑战',
    desc: '回答关于彼此的问题，测试你们的默契度',
    primaryColor: '#4096FF',
    secondaryColor: '#8CC5FF',
    icon: <FaComment size={24} style={{ color: '#4096FF' }} /> // 用已有FaComment替代问答图标
  },
  {
    id: 'love-drawing',
    name: '爱情涂鸦',
    desc: '轮流作画，共同完成一幅属于你们的作品',
    primaryColor: '#48BB78',
    secondaryColor: '#87E8DE',
    icon: <FaList size={24} style={{ color: '#48BB78' }} /> // 用已有FaList替代画笔图标
  },
  {
    id: 'couple-dice',
    name: '情侣骰子',
    desc: '掷骰子决定小任务，增加日常小惊喜',
    primaryColor: '#FFA500',
    secondaryColor: '#FFD591',
    icon: <FaCog size={24} style={{ color: '#FFA500' }} /> // 用已有FaCog（齿轮）替代骰子图标
  },
];