const path = require('path'); // eslint-disable-line @typescript-eslint/no-var-requires

module.exports = ['production', 'development'].map((mode) => ({
  mode,
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'umd'),
    filename: `tree-data${mode === 'production' ? '.min' : ''}.js`,
    library: 'TreeData',
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
