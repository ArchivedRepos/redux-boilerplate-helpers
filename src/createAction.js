import fs from 'fs';
import { join } from 'path';
import recast, { types } from 'recast';
import { constant, camel } from 'change-case';

const n = types.namedTypes;
const b = types.builders;

const codeLocation = join(__dirname, '__testfixtures__/addtoExisting');
const constantCode = fs.readFileSync(join(codeLocation, 'constants.js'), 'utf8');
const actionCode = fs.readFileSync(join(codeLocation, 'actions.js'), 'utf8');
const reducerCode = fs.readFileSync(join(codeLocation, 'reducer.js'), 'utf8');


export const parseOptions = {
  parser: {
    parse(source) {
      return require('babylon').parse(source, {
        sourceType: 'module',
        plugins: [
          'flow',
          'jsx',
          'objectRestSpread',
        ],
      });
    },
  },
};

export const generateNames = varName => (
  { constant: constant(varName), camel: camel(varName) }
);

export const setImports = (ast, name) => {
  // get all the import declarations in file
  const importStatements = ast.program.body.filter(node => (
    n.ImportDeclaration.check(node)
  ));

  // check if file is importing from adjacent constants.js file
  const constImport = importStatements.filter(node => (
    n.Literal.check(node.source) && node.source.value === './constants'
  ));

  if (constImport.length > 0) {
    const specifiers = constImport[0].specifiers;
    const importExists = specifiers
      .map(specifier => specifier.local.name)
      .includes(name.constant);

    if (!importExists) {
      const newImport = b.importSpecifier(
        b.identifier(name.constant)
      );
      specifiers.push(newImport)
    }
  } else {
    const importStatement = b.importDeclaration(
      [b.importSpecifier(b.identifier(name.constant))],
      b.literal('./constants'),
    );
    ast.program.body.splice(importStatements.length, 0, importStatement);
  }
};

export const createAction = (ast, name) => {
  recast.visit()
};

export const addConstant = (varName, { customValue, isError } = {}) => {
  const name = generateNames(varName);
  const constAst = recast.parse(constantCode, parseOptions);
  const actionAst = recast.parse(actionCode, parseOptions);
  const reducerAst = recast.parse(reducerCode, parseOptions);

  const newExport = b.exportNamedDeclaration(b.variableDeclaration('const', [
    b.variableDeclarator(
      b.identifier(name.constant),
      b.literal(`__testfixtures__/${name.constant}`),
    ),
  ]));
  constAst.program.body.push(newExport);
  console.log(recast.print(constAst).code);

  setImports(actionAst, name);
  setImports(reducerAst, name);

  console.log(recast.print(actionAst).code);
  console.log(recast.print(reducerAst).code);
};
