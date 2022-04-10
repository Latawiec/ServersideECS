const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: './build/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
  },
  resolve: {
    alias: {
        'gl-matrix': path.join(__dirname, './node_modules/gl-matrix/gl-matrix.js')
    }
  },
  optimization: {
    minimize: false
  },
  plugins: [
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
  ]
};