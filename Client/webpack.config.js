const path = require('path');
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './Source/index.ts',
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, '.build'),
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
    },
    extensions: [".ts", ".tsx", ".js", ".json"],
    plugins: [
      new TsconfigPathsPlugin({
        extensions: [".ts", ".tsx", ".js"]
      })
    ]
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
        process: 'process/browser',
    }),
    new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
    })
  ]
};