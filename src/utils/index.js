/**
 * 计算两个日期之间的天数差异
 * @param {Date|string} startDate - 开始日期
 * @param {Date|string} endDate - 结束日期
 * @param {Object} options - 配置选项
 * @param {boolean} options.includeEndDate - 是否包含结束日期
 * @param {boolean} options.absolute - 是否返回绝对值（总是正数）
 * @returns {number} 两个日期之间的天数差异
 */
function calculateDaysDifference (startDate, endDate, options = {}) {
  const {
    includeEndDate = false,
    absolute = true
  } = options;

  // 确保输入是Date对象
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate instanceof Date ? endDate : new Date(endDate);

  // 验证日期有效性
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid date format');
  }

  // 清除时间部分，只比较日期
  const startUTC = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endUTC = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

  // 计算毫秒差异并转换为天数
  const msPerDay = 1000 * 60 * 60 * 24;
  let daysDifference = (endUTC - startUTC) / msPerDay;

  // 是否包含结束日期
  if (includeEndDate && daysDifference >= 0) {
    daysDifference += 1;
  } else if (includeEndDate && daysDifference < 0) {
    daysDifference -= 1;
  }

  // 是否返回绝对值
  return absolute ? Math.abs(daysDifference) : daysDifference;
}

/**
 * 计算从某个日期到现在的天数
 * @param {Date|string} date - 起始日期
 * @param {Object} options - 配置选项
 * @returns {number} 从起始日期到现在的天数
 */
export function calculateDaysFromNow (date, options = {}) {
  return calculateDaysDifference(date, new Date(), options);
}

/**
 * 计算距离下一个生日还有多少天
 * @param {Date|string} birthday - 生日日期
 * @param {Object} options - 配置选项
 * @param {boolean} options.includeBirthday - 是否包含生日当天（默认false）
 * @param {boolean} options.absolute - 是否返回绝对值（默认true）
 * @returns {number} 距离下一个生日的天数
 */
export function calculateDaysUntilBirthday (birthday, options = {}) {
  const {
    includeBirthday = false,
    absolute = true
  } = options;

  // 确保输入是Date对象
  const bday = birthday instanceof Date ? birthday : new Date(birthday);

  // 验证日期有效性
  if (isNaN(bday.getTime())) {
    throw new Error('Invalid birthday format');
  }

  const today = new Date();
  const currentYear = today.getFullYear();

  // 设置今年生日日期
  const nextBday = new Date(currentYear, bday.getMonth(), bday.getDate());

  // 如果今年生日已经过了，计算明年生日
  if (today > nextBday) {
    nextBday.setFullYear(currentYear + 1);
  }

  // 清除时间部分，只比较日期
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const nextBdayUTC = Date.UTC(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate());

  // 计算差异并转换为天数
  const msPerDay = 1000 * 60 * 60 * 24;
  let daysDifference = (nextBdayUTC - todayUTC) / msPerDay;

  // 是否包含生日当天
  if (includeBirthday) {
    daysDifference += 1;
  }

  // 是否返回绝对值
  return absolute ? Math.abs(daysDifference) : daysDifference;
}

/**
 * 返回动态图片
 */
export function getPlaceholderImage (id, width = 400, height = 300) {
  return `https://picsum.photos/id/${id}/${width}/${height}`;
};

