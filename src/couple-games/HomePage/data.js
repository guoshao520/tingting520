import { FaHeart, FaComment, FaImage, FaList, FaCog, FaPaintBrush, FaDice } from 'react-icons/fa'; 

export const coupleGamesData = [
  {
    id: 'puzzle-together-super',
    name: '恋恋拼图',
    desc: '上传你们的合照，一起拼出专属回忆',
    primaryColor: '#FF6B8A',
    secondaryColor: '#FFA7B5',
    icon: <FaImage size={24} style={{ color: '#FF6B8A' }} /> // 保持不变，图片图标适配拼图
  },
  {
    id: 'couple-dice',
    name: '情侣骰子',
    desc: '掷骰子决定小任务，增加日常小惊喜',
    primaryColor: '#FFA500',
    secondaryColor: '#FFD591',
    icon: <FaDice size={24} style={{ color: '#FFA500' }} /> // 骰子图标直接匹配骰子功能
  },
  // {
  //   id: 'puzzle-together-super',
  //   name: '恋恋拼图(变态版)',
  //   desc: '上传你们的合照，一起拼出专属回忆',
  //   primaryColor: '#FF6B8A',
  //   secondaryColor: '#FFA7B5',
  //   icon: <FaImage size={24} style={{ color: '#FF6B8A' }} /> // 保持不变，图片图标适配拼图
  // },
  // {
  //   id: 'couple-dice-super',
  //   name: '情侣骰子(变态版)',
  //   desc: '掷骰子决定小任务，增加日常小惊喜',
  //   primaryColor: '#FFA500',
  //   secondaryColor: '#FFD591',
  //   icon: <FaDice size={24} style={{ color: '#FFA500' }} /> // 骰子图标直接匹配骰子功能
  // },
];