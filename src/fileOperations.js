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

const addReduxActions = (dir: string, actions: Array<string>, options: Object = {}) => {
  const names = actions.map(generateNames);
  const prefixDir = dir[dir.length - 1] !== sep ? `${dir}${sep}` : dir;
  const workingDir = join(process.cwd(), prefixDir);
  const prefix = workingDir.split(sep).slice(-2).join('/').slice(0, -1);
  const files = fs.readdirSync(workingDir);

  if (!files.includes('constants.js')) {
    fs.writeFileSync(join(workingDir, 'constants.js'), '');
  }

  if (!files.includes('actions.js')) {
    fs.writeFileSync(join(workingDir, 'actions.js'), '');
  }

  if (!files.includes('reducer.js')) {
    const reducerTemplate = fs.readFileSync(join(__dirname, '../assets/reducer.js'), 'utf8');
    fs.writeFileSync(
      join(workingDir, 'reducer.js'),
      prettier.format(reducerTemplate, options.prettier),
    );
  }

  const constantsFile = fs.readFileSync(join(workingDir, 'constants.js'), 'utf8');
  const constantsAst = recast.parse(constantsFile, parseOptions);

  const actionsFile = fs.readFileSync(join(workingDir, 'actions.js'), 'utf8');
  const actionsAst = recast.parse(actionsFile, parseOptions);

  const reducerFile = fs.readFileSync(join(workingDir, 'reducer.js'), 'utf8');
  const reducerAst = recast.parse(reducerFile, parseOptions);

  names.forEach(name => {
    createConst(constantsAst, name, prefix);

    setImports(actionsAst, name, { insertHelper: true });
    createAction(actionsAst, name);

    setImports(reducerAst, name);
    createReducerCase(reducerAst, name);
  });

  // const constantsResult = prettier.__debug.formatAST(constantsAst, options.prettier).formatted;
  // const actionsResult = prettier.__debug.formatAST(actionsAst, options.prettier).formatted;
  // const reducerResult = prettier.__debug.formatAST(reducerAst, options.prettier).formatted;

  const constantsResult = prettier.format(recast.print(constantsAst).code, options.prettier);
  const actionsResult = prettier.format(recast.print(actionsAst).code, options.prettier);
  const reducerResult = prettier.format(recast.print(reducerAst).code, options.prettier);

  if (options.dry) {
    console.log(`==== ${join(dir, 'constants.js')} ====`);
    console.log(constantsResult);
    console.log(`==== ${join(dir, 'actions.js')} ====`);
    console.log(actionsResult);
    console.log(`==== ${join(dir, 'reducer.js')} ====`);
    console.log(reducerResult);
  } else {
    fs.writeFileSync(join(workingDir, 'constants.js'), constantsResult);
    fs.writeFileSync(join(workingDir, 'actions.js'), actionsResult);
    fs.writeFileSync(join(workingDir, 'reducer.js'), reducerResult);
  }
};

export default addReduxActions;
