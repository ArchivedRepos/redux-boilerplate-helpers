/* eslint-env jest */

import webpack from 'webpack';
import fs from 'fs';
import { join } from 'path';
import mkdirp from 'mkdirp';
import del from 'del';
import run from '../testUtils';
import webpackConfig from '../../webpack.config.babel';

describe('cli', () => {
  beforeAll(done => {
    webpack(webpackConfig[1], done);
  });

  it('adds actions to existing files in dry run', () => {
    const cmd = run(join(__dirname, '../__testfixtures__'), [
      '--dir',
      './addToExisting',
      'oneAction',
      'twoAction',
      '--dry',
      '--single-quote',
      '--trailing-comma',
      'all',
    ]);
    expect(cmd.stderr).toEqual('');
    expect(cmd.stdout).toMatchSnapshot();
  });

  it('creates files if they are not present', () => {
    const dir = join(__dirname, '../__testfixtures__/blank');
    mkdirp.sync(dir);
    const cmd = run(join(__dirname, '../__testfixtures__'), [
      '--dir',
      './blank',
      'oneAction',
      'twoAction',
      '--single-quote',
      '--trailing-comma',
      'all',
    ]);
    const constResult = fs.readFileSync(join(dir, 'constants.js'), 'utf8');
    const actionsResult = fs.readFileSync(join(dir, 'actions.js'), 'utf8');
    const reducerResult = fs.readFileSync(join(dir, 'reducer.js'), 'utf8');
    expect(cmd.stderr).toEqual('');
    expect(constResult).toMatchSnapshot();
    expect(actionsResult).toMatchSnapshot();
    expect(reducerResult).toMatchSnapshot();
    del.sync([join(__dirname, '../__testfixtures__/blank/**')]);
  });
});
