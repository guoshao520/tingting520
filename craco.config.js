const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/data': path.resolve(__dirname, 'src/data'),
    }
  }
};