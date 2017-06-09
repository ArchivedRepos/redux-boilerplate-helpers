/* eslint-env jest */

import fs from 'fs';
import addReduxActions from '../fileOperations';
import {
  generateNames,
  setImports,
  createAction,
  createReducerCase,
  createConst,
} from '../createAction';

jest.mock('../createAction.js', () => ({
  generateNames: jest.fn(() => ({ camel: 'testName', constant: 'TEST_NAME' })),
  setImports: jest.fn(),
  createAction: jest.fn(),
  createReducerCase: jest.fn(),
  createConst: jest.fn(),
}));

jest.mock('fs', () => ({
  readdirSync: jest.fn(() => ['constants.js', 'actions.js', 'reducer.js']),
  readFileSync: jest.fn(() => ''),
  writeFileSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn(() => '/tmp'),
}));

describe('File Operations', () => {
  afterEach(() => {
    generateNames.mockClear();
    setImports.mockClear();
    createAction.mockClear();
    createReducerCase.mockClear();
    createConst.mockClear();
    fs.readFileSync.mockClear();
    fs.writeFileSync.mockClear();
    fs.readdirSync.mockClear();
  });

  it('adds an action to the files', () => {
    addReduxActions('./', []);

    expect(setImports.mock.calls).toMatchSnapshot();
    expect(createConst.mock.calls).toMatchSnapshot();
    expect(createAction.mock.calls).toMatchSnapshot();
    expect(createReducerCase.mock.calls).toMatchSnapshot();
    expect(fs.writeFileSync.mock.calls).toMatchSnapshot();
    expect(fs.readFileSync.mock.calls).toMatchSnapshot();
    expect(fs.readdirSync.mock.calls).toMatchSnapshot();
  });

  it('adds multiple actions to the files', () => {
    const generateNamesOrig = require.requireActual('../createAction').generateNames;
    generateNames.mockImplementationOnce(generateNamesOrig);
    addReduxActions('./', ['testOne', 'testTwo', 'testThree']);

    expect(setImports.mock.calls).toMatchSnapshot();
    expect(createConst.mock.calls).toMatchSnapshot();
    expect(createAction.mock.calls).toMatchSnapshot();
    expect(createReducerCase.mock.calls).toMatchSnapshot();
    expect(fs.writeFileSync.mock.calls).toMatchSnapshot();
    expect(fs.readFileSync.mock.calls).toMatchSnapshot();
    expect(fs.readdirSync.mock.calls).toMatchSnapshot();
  });

  it('creates files that are not preset', () => {
    setImports.mockReset();
    fs.readdirSync.mockImplementationOnce(() => []);
    addReduxActions('./', []);

    expect(setImports.mock.calls).toMatchSnapshot();
    expect(createConst.mock.calls).toMatchSnapshot();
    expect(createAction.mock.calls).toMatchSnapshot();
    expect(createReducerCase.mock.calls).toMatchSnapshot();
    expect(fs.writeFileSync.mock.calls).toMatchSnapshot();
    expect(fs.readFileSync.mock.calls).toMatchSnapshot();
    expect(fs.readdirSync.mock.calls).toMatchSnapshot();
  });

  it('does a dry run', () => {
    const log = console.log;
    console.log = jest.fn();

    addReduxActions('./', [], { dry: true });
    console.log = log;
  });
});
