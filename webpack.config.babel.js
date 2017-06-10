import { join } from 'path';
import { readFileSync } from 'fs';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

const babelrc = JSON.parse(readFileSync(join(__dirname, '.babelrc')));

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

export const webConfig = {
  entry: [join(__dirname, 'src/helper.js')],
  ...base,
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true,
        warnings: false,
      }
    }),
  ],
  output: {
    path: join(__dirname, 'dist'),
    filename: 'index.js',
    publicPath: '/',
    library: 'CreateAction',
    libraryTarget: 'umd',
  },
  devtool: 'source-map',
};

export const toolConfig = {
  entry: [join(__dirname, 'src/cli.js')],
  plugins: [
    new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
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
};

export default [webConfig, toolConfig];
