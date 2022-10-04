const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: './build/Source/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'build'),
  },
  resolve: {
    fallback: {
      zlib: require.resolve("browserify-zlib"),
      stream: "stream-browserify",
	    _stream_duplex: "readable-stream/duplex",
      constants: require.resolve("constants-browserify"),
      buffer: require.resolve("buffer/"),
      fs: require.resolve("browserify-fs")
    },
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
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    }),
  ]
};