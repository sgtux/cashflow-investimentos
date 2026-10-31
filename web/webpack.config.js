const path = require('path')
const ProgressBar = require('progress-bar-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: './src/App.jsx',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }, {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: `bundle${(new Date()).getTime()}.js`
  },
  plugins: [
    new ProgressBar(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'public', 'index.html'),
      title: 'Bê-a-bá da Grana · Rende',
      favicon: path.join(__dirname, 'public', 'brand', 'favicon-32.png')
    }),
    new CleanWebpackPlugin()
  ],
  devServer: {
    static: './public',
    port: 3001
  }
}
