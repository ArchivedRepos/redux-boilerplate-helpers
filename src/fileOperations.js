// @flow
import fs from 'fs';
import { join, sep } from 'path';
import recast from 'recast';
import prettier from 'prettier';

import {
  generateNames,
  setImports,
  createAction,
  parseOptions,
  createReducerCase,
  createConst,
} from './createAction';

const addReduxActions = (dir: string, actions: Array<string>, options: Object) => {
  const names = actions.map(generateNames);
  const workingDir = join(process.cwd(), dir);
  const prefix = workingDir.split(sep).slice(-1).join('/');
  const files = fs.readdirSync(workingDir);

  if (!files.includes('constants.js')) {
    fs.writeFileSync(join(workingDir, 'constants.js'), '');
  }

  if (!files.includes('actions.js')) {
    fs.writeFileSync(join(workingDir, 'actions.js'), '');
  }

  if (!files.includes('reducer.js')) {
    const reducerTemplate = fs.readFileSync('../assets/reducer.js');
    fs.writeFileSync(join(workingDir, 'reducer.js'), prettier.format(reducerTemplate, options));
  }

  const constantsFile = fs.readFileSync(join(workingDir, 'constants.js'));
  const constantsAst = recast.parse(constantsFile, parseOptions);

  const actionsFile = fs.readFileSync(join(workingDir, 'actions.js'));
  const actionsAst = recast.parse(actionsFile, parseOptions);

  const reducerFile = fs.readFileSync(join(workingDir, 'reducer.js'));
  const reducerAst = recast.parse(reducerFile, parseOptions);

  names.forEach(name => {
    createConst(constantsAst, name, prefix);

    setImports(actionsAst, name, { insertHelper: true });
    createAction(actionsAst, name);

    setImports(reducerAst, name);
    createReducerCase(reducerAst, name);
  });

  /* eslint-disable no-underscore-dangle */
  fs.writeFileSync(join(workingDir, 'constants.js'), prettier.__debug.formatAST(constantsAst));
  fs.writeFileSync(join(workingDir, 'actions.js'), prettier.__debug.formatAST(actionsAst));
  fs.writeFileSync(join(workingDir, 'reducer.js'), prettier.__debug.formatAST(reducerAst));
};

export default addReduxActions;
