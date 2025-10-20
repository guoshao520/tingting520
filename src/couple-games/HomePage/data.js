import {
  FaHeart,
  FaComment,
  FaImage,
  FaList,
  FaCog,
  FaPaintBrush,
  FaDice,
} from 'react-icons/fa';

export const coupleGamesData = [
  {
    id: 'puzzle-together',
    name: '恋恋拼图',
    desc: '上传你们的合照，拼出专属回忆',
    primaryColor: '#FF6B8A', // 粉红色（偏冷调粉）
    secondaryColor: '#FFA7B5',
    icon: <FaImage size={24} style={{ color: '#FF6B8A' }} />,
  },
  {
    id: 'couple-dice',
    name: '情侣骰子',
    desc: '掷骰子决定小任务，增加日常小惊喜',
    primaryColor: '#FFB875', // 浅珊瑚橙（暖调，与粉色同属暖色）
    secondaryColor: '#FFE0C3',
    icon: <FaDice size={24} style={{ color: '#FFB875' }} />,
  },
  {
    id: 'heart-mine-capture',
    name: ' 心动地雷捕捉计划 ',
    desc: ' 双人协作扫雷，每一步都藏着心动信号 ',
    primaryColor: '#E8759F', // 柔玫瑰粉（偏暖调粉）
    secondaryColor: '#F5C3D7',
    icon: <FaHeart size={24} style={{ color: '#E8759F' }} />,
  }
];