import image1 from '@/assets/images/first/mmexport1758163874562.jpg';
import image2 from '@/assets/images/first/mmexport1758163846866.jpg';

import image1_1 from '@/assets/images/first/mmexport1758163874562.jpg';
import image1_2 from '@/assets/images/first/mmexport1758163850500.jpg';
import image1_3 from '@/assets/images/first/mmexport1758163871480.jpg';
import image1_4 from '@/assets/images/first/mmexport1758163862275.jpg';
import image1_5 from '@/assets/images/first/mmexport1758163858356.jpg';
import image1_6 from '@/assets/images/first/mmexport1758163854505.jpg';
import image1_7 from '@/assets/images/first/mmexport1758163846866.jpg';

const importantDates = [
  { id: 1, title: '她的生日', date: '2003-02-28', color: '#7068EE' },
  { id: 2, title: '他的生日', date: '2000-07-25', color: '#FFA500' }
];

const memories = [
  { id: 1, title: '第一次约会', image: image1, boy_content: '那天我们一起坐了过山车，你在最高点紧紧抓住我的手；中午吃饭时你笑着说喜欢壮一点的男生，我悄悄记在心里；下午在汉口码头和你一起坐着，看见一个很帅的大哥从高空飞过来暴打鬼子。第二天我回深圳前，带了一束鲜花等你。悄悄问你"喜欢吗？"时，你先是一愣，随即绽放的笑容比那天的阳光还要灿烂。', date: '2024-06-08' },
];

const memorieInfo = {
  1: {
    id: 1,
    title: "第一次约会",
    location: "武汉光谷",
    boy_content: '那天我们一起坐了过山车，你在最高点紧紧抓住我的手；中午吃饭时你笑着说喜欢壮一点的男生，我悄悄记在心里；下午在汉口码头和你一起坐着，看见一个很帅的大哥从高空飞过来暴打鬼子。第二天我回深圳前，带了一束鲜花等你。悄悄问你"喜欢吗？"时，你先是一愣，随即绽放的笑容比那天的阳光还要灿烂。',
    date: '2024-06-08',
    images: [
      image1_1,
      image1_2,
      image1_3,
      image1_4,
      image1_5,
      image1_6,
      image1_7,
    ],
    weather: '晴朗',
    mood: '开心',
  }
}

export {
  importantDates, memories, memorieInfo
}