import fs from 'fs';
import { join } from 'path';
import recast, { types } from 'recast';
import { constant, camel } from 'change-case';

const n = types.namedTypes;
const b = types.builders;

export const parseOptions = {
  parser: {
    parse(source) {
      return require('babylon').parse(source, {
        sourceType: 'module',
        plugins: ['flow', 'jsx', 'objectRestSpread'],
      });
    },
  },
};

export const generateNames = varName => ({ constant: constant(varName), camel: camel(varName) });

export const setImports = (
  ast,
  name,
  { insertHelper, moduleName = 'redux-boilerplate-helpers' } = {},
) => {
  // get all the import declarations in file
  const importStatements = ast.program.body.filter(node => n.ImportDeclaration.check(node));

  // check if file is importing from adjacent constants.js file
  const constImport = importStatements.filter(
    node => n.Literal.check(node.source) && node.source.value === './constants',
  );

  if (constImport.length > 0) {
    const specifiers = constImport[0].specifiers;
    const importExists = specifiers.map(specifier => specifier.local.name).includes(name.constant);

    if (!importExists) {
      const newImport = b.importSpecifier(b.identifier(name.constant));
      specifiers.push(newImport);
    }
  } else {
    const importStatement = b.importDeclaration(
      [b.importSpecifier(b.identifier(name.constant))],
      b.literal('./constants'),
    );
    ast.program.body.splice(importStatements.length, 0, importStatement);
  }

  if (insertHelper) {
    const checkForHelper = node => {
      const hasLiteral = n.Literal.check(node.source);
      const hasIdentifier = node.specifiers.map(n.ImportSpecifier.check).every(val => val === true);
      const correctLiteral = node.source.value === moduleName;

      // make sure the other conditions are true before evaluating this one
      const containsSpecifier = () =>
        node.specifiers
          .map(specifier => specifier.imported)
          .map(imported => imported.name)
          .includes('createAction');
      return hasLiteral && hasIdentifier && correctLiteral && containsSpecifier();
    };
    const helperImports = importStatements.filter(checkForHelper);

    if (helperImports.length <= 0) {
      const newHelperImport = b.importDeclaration(
        [b.importSpecifier(b.identifier('createAction'))],
        b.literal(moduleName),
      );
      ast.program.body.unshift(newHelperImport);
    }
  }
};

export const createAction = (ast, name) => {
  let exists = false;
  recast.visit(ast, {
    visitIdentifier(path) {
      const node = path.node;
      if (node.name === name.constant && !n.ImportSpecifier.check(path.parent.node)) {
        exists = true;
        this.abort();
      }
      this.traverse(path);
    },
  });

  if (!exists) {
    const newActionCreator = b.exportNamedDeclaration(
      b.variableDeclaration('const', [
        b.variableDeclarator(
          b.identifier(name.camel),
          b.callExpression(
            b.identifier('createAction'),
            [b.identifier(name.constant)],
          ),
        ),
      ]),
    );
    ast.program.body.push(newActionCreator);
  }
};

};

export const addConstant = (varName, { customValue, isError } = {}) => {
  const name = generateNames(varName);
  const constAst = recast.parse(constantCode, parseOptions);
  const actionAst = recast.parse(actionCode, parseOptions);
  const reducerAst = recast.parse(reducerCode, parseOptions);

  const newExport = b.exportNamedDeclaration(
    b.variableDeclaration('const', [
      b.variableDeclarator(
        b.identifier(name.constant),
        b.literal(`__testfixtures__/${name.constant}`),
      ),
    ]),
  );
  constAst.program.body.push(newExport);
  console.log(recast.print(constAst).code);

  setImports(actionAst, name);
  setImports(reducerAst, name);

  console.log(recast.print(actionAst).code);
  console.log(recast.print(reducerAst).code);
};
