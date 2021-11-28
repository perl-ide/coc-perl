const path = require('path')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

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
    new ForkTsCheckerWebpackPlugin(),
    new ESLintPlugin({
      extensions: ['ts', 'js']
    })
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ]
  },
}
