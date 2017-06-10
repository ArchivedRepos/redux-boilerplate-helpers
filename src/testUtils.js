// @flow

import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import { sync as spawnSync } from 'cross-spawn';

export const RDXH_PATH = path.resolve(__dirname, '../bin/index.js');

export default (dir: string, args?: Array<string>, options: Object = {}) => {
  const isRelative = dir[0] !== '/';
  const cwd = isRelative ? path.resolve(__dirname, dir) : dir;

  const env = options.nodePath ? { ...process.env, NODE_PATH: options.nodedPath } : process.env;
  spawnSync('chmod', ['+x', RDXH_PATH]);
  const result = spawnSync(RDXH_PATH, args || [], {
    cwd,
    env,
  });

  result.stdout = result.stdout && result.stdout.toString();
  result.stderr = result.stderr && result.stderr.toString();

  return result;
};
