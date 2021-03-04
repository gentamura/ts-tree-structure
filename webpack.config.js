const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = ['production', 'development'].map((mode) => ({
  mode,
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'umd'),
    filename: `ts-tree-structure${mode === 'production' ? '.min' : ''}.js`,
    library: 'Tree',
    libraryTarget: 'umd',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.umd.json',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
}));
