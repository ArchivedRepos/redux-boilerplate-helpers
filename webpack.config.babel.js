import { join } from 'path';
import { readFileSync } from 'fs';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

//TODO: cleanup this file...

const babelrc = JSON.parse(readFileSync(join(__dirname, '.babelrc')));

export const setOptions = prod => {
  if (process.env.NODE_ENV === 'production' || prod) {
    return {
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: false,
          mangle: true,
          compress: {
            warnings: false,
            dead_code: true,
            unused: true,
            drop_console: true,
          },
        }),
      ],
      performance: { hints: 'warning' },
    };
  }
  return {
    plugins: [],
    performance: { hints: false },
    devtool: 'source-map',
    devServer: {
      disableHostCheck: true,
    },
  };
};

const base = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: babelrc,
      },
    ],
  },
};

export const createWebConfig = options => ({
  entry: [join(__dirname, 'src/helper.js')],
  plugins: [...options.plugins],
  ...base,
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
  },
  target: 'web',
  devtool: options.devtool,
  performance: options.performance,
  devServer: options.devServer,
});

export const createToolConfig = options => ({
  entry: [join(__dirname, 'src/cli.js')],
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ...options.plugins
  ],
  ...base,
  output: {
    path: join(__dirname, 'bin'),
    filename: 'index.js',
    publicPath: '/',
  },
  target: 'node',
  node: {
    __dirname: false,
  },
  externals: [nodeExternals()],
  devtool: options.devtool,
  performance: options.performance,
  devServer: options.devServer,
});

export default [createWebConfig(setOptions()), createToolConfig(setOptions())];
