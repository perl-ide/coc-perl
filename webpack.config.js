const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  mode: 'none',
  target: 'node',
  entry: './src/extension.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: "commonjs",
  },
  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.ts'],
    mainFields: ['browser', 'module', 'main'],
    mainFiles: ['index']
  },
  externals: {
    'coc.nvim': 'commonjs coc.nvim'
  },
  plugins: [
    new ForkTsCheckerWebpackPlugin()
  ],
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(ts|js)$/,
        use: 'eslint-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(ts|js)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ]
  },
}
