/* eslint-env jest */
import recast from 'recast';
import { generateNames, setImports, createAction, parseOptions } from '../createAction';

const bodycode = [
  'function something() {',
  '  console.log("test");',
  '}',
  'const x = 10;',
  'export default something',
];

describe('createAction', () => {
  const name = generateNames('TEST_ENTRY');
  it('creats a new import statement if it does not exist', () => {
    const header = [
      'import { ONE, TWO, THREE } from "othermodule";',
      'import module from "./something";',
    ];
    const input = [...header, ...bodycode].join('\n');
    const ast = recast.parse(input, parseOptions);

    setImports(ast, name);
    const result = recast.print(ast).code;
    expect(result).toEqual(
      [...header, `import { ${name.constant} } from "./constants";`, ...bodycode].join('\n'),
    );
  });

  it('adds the action to an existing import statment', () => {
    const header = [
      "import { ONE, TWO, THREE } from './constants';",
      'import module from "./something";',
    ];
    const input = [...header, ...bodycode].join('\n');
    const ast = recast.parse(input, parseOptions);

    setImports(ast, name);
    const result = recast.print(ast).code;
    expect(result).toEqual(
      [
        `import { ONE, TWO, THREE, ${name.constant} } from './constants';`,
        header[1],
        ...bodycode,
      ].join('\n'),
    );
  });

  it('does not modify imports if it exists already', () => {
    const input = [
      `import { ONE, TWO, THREE, ${name.constant} } from './constants';`,
      'import module from "./something";',
      ...bodycode,
    ].join('\n');
    const ast = recast.parse(input, parseOptions);

    setImports(ast, name);
    const result = recast.print(ast).code;
    expect(result).toEqual(input);
  });

  it('imports the helper function if it is not there', () => {
    const header = [
      "import { ONE, TWO, THREE } from './constants';",
      'import module from "./something";',
    ];
    const input = [...header, ...bodycode].join('\n');
    const ast = recast.parse(input, parseOptions);

    setImports(ast, name, { insertHelper: true });
    const result = recast.print(ast).code;
    expect(result).toEqual(
      [
        'import { createAction } from "redux-boilerplate-helpers";',
        `import { ONE, TWO, THREE, ${name.constant} } from './constants';`,
        header[1],
        ...bodycode,
      ].join('\n'),
    );
  });

  it('does not add helper function if it is already there', () => {
    const header = [
      'import { createAction } from "redux-boilerplate-helpers";',
      "import { ONE, TWO, THREE } from './constants';",
      'import module from "./something";',
    ];
    const input = [...header, ...bodycode].join('\n');
    const ast = recast.parse(input, parseOptions);

    setImports(ast, name, { insertHelper: true });
    const result = recast.print(ast).code;
    expect(result).toEqual(
      [
        header[0],
        `import { ONE, TWO, THREE, ${name.constant} } from './constants';`,
        header[2],
        ...bodycode,
      ].join('\n'),
    );
  });
});
