import React from 'react';
import './FooterRecord.less';

/**
 * 底部备案信息组件
 * @param {Object} props - 组件参数
 * @param {string} [props.icpRecord] - ICP备案号（必填，如：粤ICP备XXXX号-X）
 * @param {string} [props.policeRecord] - 公安备案号（可选，如：粤公网安备XXXX号）
 * @param {string} [props.copyright] - 版权信息（可选，默认：© 2025 公司名称. 保留所有权利）
 * @param {string} [props.icpLink] - ICP备案查询链接（默认：工信部备案查询官网）
 * @param {string} [props.policeLink] - 公安备案查询链接（默认：公安备案查询官网）
 * @param {string} [props.extraText] - 额外说明文本（可选，如：本网站内容仅供参考）
 * @param {string} [props.className] - 自定义外层类名（可选，用于样式扩展）
 */
const FooterRecord = ({
  icpRecord,
  policeRecord,
  copyright = '© 2025 公司名称. 保留所有权利',
  icpLink = 'https://beian.miit.gov.cn/',
  policeLink = 'http://www.beian.gov.cn/portal/registerSystemInfo',
  extraText,
  className,
  bottom = "2rem"
}) => {
  // 校验必填的ICP备案号
  if (!icpRecord) {
    console.warn('FooterRecord 组件：ICP备案号（icpRecord）为必填项');
    return null;
  }

  return (
    <footer className={`footer-record ${className || ''}`} style={{ bottom }}>
      {/* 版权信息 */}
      {copyright && <p className="footer-record__copyright">{copyright}</p>}

      {/* 备案信息容器 */}
      <div className="footer-record__container">
        {/* ICP备案 */}
        <a
          href={icpLink}
          target="_blank"
          rel="noopener noreferrer"
          className="footer-record__link"
        >
          {icpRecord}
        </a>

        {/* 公安备案（有则显示，无则隐藏） */}
        {policeRecord && (
          <>
            <span className="footer-record__separator">|</span>
            <a
              href={policeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-record__link"
            >
              {policeRecord}
            </a>
          </>
        )}
      </div>

      {/* 额外说明文本（有则显示） */}
      {extraText && <p className="footer-record__extra">{extraText}</p>}
    </footer>
  );
};

export default FooterRecord;
