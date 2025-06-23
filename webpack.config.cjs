const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

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
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
    plugins: [
      // Main app
      new HtmlWebpackPlugin({
        template: isProduction ? './archive/dev-files/index-gh-pages.html' : './index.html',
        filename: 'app.html',
        inject: 'body'
      }),
      // Landing page (as index for GitHub Pages)
      new HtmlWebpackPlugin({
        template: './landing.html',
        filename: isProduction ? 'index.html' : 'landing.html',
        inject: false
      }),
      // Changelog viewer
      new HtmlWebpackPlugin({
        template: './changelog.html',
        filename: 'changelog.html',
        inject: false
      }),
      // Copy static files
      new CopyWebpackPlugin({
        patterns: [
          { from: 'CHANGELOG.md', to: 'CHANGELOG.md' }
        ]
      })
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, 'public')
      },
      compress: true,
      port: 8080,
      hot: true,
      open: isProduction ? false : '/app.html'
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map'
  };
};