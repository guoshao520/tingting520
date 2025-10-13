const path = require('path');
const CracoLessPlugin = require('craco-less');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/pages': path.resolve(__dirname, 'src/pages'),
      '@/couple-games': path.resolve(__dirname, 'src/couple-games'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/data': path.resolve(__dirname, 'src/data'),
      '@/api': path.resolve(__dirname, 'src/api'),
    }
  },
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        // 配置 Less 加载器
        lessLoaderOptions: {
          lessOptions: {
            // 允许在 Less 中使用 JavaScript 表达式（可选）
            javascriptEnabled: true,
            // 全局变量（可选，定义后可在所有 Less 文件中直接使用）
            modifyVars: {
              '@primary-color': '#ff6b8b', // 示例：全局主题色
              '@text-color': '#333333'
            }
          }
        }
      }
    }
  ]
};