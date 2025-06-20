const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';
  
  return {
    mode: argv.mode || 'development',
    entry: './src/app.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      clean: true,
      // For GitHub Pages subdirectory
      publicPath: isProduction ? '/road_mapper/' : '/'
    },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
    plugins: [
      new HtmlWebpackPlugin({
        template: isProduction ? './index-gh-pages.html' : './index.html',
        filename: 'index.html',
        inject: 'body'
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 8080,
      hot: true,
      open: true
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};