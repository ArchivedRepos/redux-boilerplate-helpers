# redux-boilerplate-helpers

[![Build Status](https://travis-ci.org/alxlu/redux-boilerplate-helpers.svg?branch=master)](https://travis-ci.org/alxlu/redux-boilerplate-helpers)
[![Coverage Status](https://coveralls.io/repos/github/alxlu/redux-boilerplate-helpers/badge.svg?branch=master)](https://coveralls.io/github/alxlu/redux-boilerplate-helpers?branch=master)
[![npm](https://img.shields.io/npm/v/redux-boilerplate-helpers.svg)](https://www.npmjs.com/package/redux-boilerplate-helpers)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

<details>
<summary><strong>Table of Contents</strong></summary>

- [Tool](#tool)
- [Action Creator](#actioncreator)
- [Usage](#usage)
- [Installation](#installation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
</details>

---

A commandline tool and small helper library that helps you cut down on the amount of typing you
need to do while writing Redux boilerplate.

Currently, the existing tools used for automating Redux Boilerplate only create new files from
templates and are unable to modify existing files. `redux-boilerplate-helpers`'s tool parses your
code into an AST (Abstract Syntax Tree) to automate adding Redux boilerplate code into your existing
files. If you already have existing[\*](#format-footnote) action creators, constants, or a reducer
in a file, it will ensure the code you want to add is put in the correct place. And if you are
missing any of the files, the tool will create new ones for you.

<a href="#format-footnote" name="styling-footnote">\*</a> Provided your code follows the following
format. That being said, this tool should flexible enough to be modified to handle most setups (See
[Roadmap](#roadmap) for more info).


## Tool
Let's start out with the following three files which already have content in them: 
`Demo/constants.js`, `Demo/actions.js`, `Demo/reducer.js`

```javascript
// Demo/constants.js
export const SOME_ACTION = 'Demo/SOME_ACTION';
export const ANOTHER_ACTION = 'Demo/ANOTHER_ACTION';

```

```javascript
// Demo/actions.js
import { createAction } from 'redux-boilerplate-helpers'; // see `Lib` section
import { SOME_ACTION, ANOTHER_ACTION } from './constants';

// this is equivalent to `export const someAction = payload => ({ type: SOME_ACTION, payload });
export const someAction = createAction(SOME_ACTION);
export const anotherAction = createAction(ANOTHER_ACTION);
```

```javascript
// Demo/reducer.js
import { SOME_ACTION, ANOTHER_ACTION } from './constants';

const initialState = {};

function demoReducer (state = initialState, action) {
  switch(action.type) {
    case SOME_ACTION:
      return { ...state, id: action.payload.id, result: action.payload.result };
    case ANOTHER_ACTION:
      return { ...state, something: action.payload };
    default:
      return state;
  }
}

export default demoReducer;
```

If we want to add three more actions: `GET_SOMETHING`, `GET_SOMETHING_SUCCESS`, and
`GET_SOMETHING_ERROR`, we can simply run
```bash
rdxh --dir ./Demo getSomething get_something_success getSomethingError --single-quote --trailing-comma all
```
We can use any combination of camelCase, PascalCase, snake_case, or CONSTANT_CASE to specify the
action names. Formatting options are passed directly to
[`prettier`](https://github.com/prettier/prettier)&mdash;which is what this tool uses to format the
finalized output:


```javascript
// Demo/constants.js
export const SOME_ACTION = 'Demo/SOME_ACTION';
export const ANOTHER_ACTION = 'Demo/ANOTHER_ACTION';
export const GET_SOMETHING = 'Demo/GET_SOMETHING';
export const GET_SOMETHING_SUCCESS = 'Demo/GET_SOMETHING_SUCCESS';
export const GET_SOMETHING_ERROR = 'Demo/GET_SOMETHING_ERROR';

```

```javascript
// Demo/actions.js
import { createAction } from 'redux-boilerplate-helpers'; // see `Lib` section
import {
  SOME_ACTION,
  ANOTHER_ACTION,
  GET_SOMETHING,
  GET_SOMETHING_SUCCESS,
  GET_SOMETHING_ERROR,
} from './constants';

// this is equivalent to `export const someAction = payload => ({ type: SOME_ACTION, payload });
export const someAction = createAction(SOME_ACTION);
export const anotherAction = createAction(ANOTHER_ACTION);
export const getSomething = createAction(GET_SOMETHING);
export const getSomethingSuccess = createAction(GET_SOMETHING_SUCCESS);
export const getSomethingError = createAction(GET_SOMETHING_ERROR);
```

```javascript
// Demo/reducer.js
import {
  SOME_ACTION,
  ANOTHER_ACTION,
  GET_SOMETHING,
  GET_SOMETHING_SUCCESS,
  GET_SOMETHING_ERROR,
} from './constants';
const initialState = {};

function demoReducer(state = initialState, action) {
  switch (action.type) {
    case SOME_ACTION:
      return { ...state, id: action.payload.id, result: action.payload.result };
    case ANOTHER_ACTION:
      return { ...state, something: action.payload };
    case GET_SOMETHING:
      return {
        ...state,
      };
    case GET_SOMETHING_SUCCESS:
      return {
        ...state,
      };
    case GET_SOMETHING_ERROR:
      return {
        ...state,
      };
    default:
      return state;
  }
}

export default demoReducer;
```

The tool will also make sure it doesn't add duplicate entries if parts of the code are already
in place (e.g. if you define a constant and create an action for it, if you run the tool with
that constant name as a paramter, the tool will only modify the reducers.js file).

And if the `constants.js`, `actions.js`, or `reducer.js` file is not present in the directory, the
tool will create them for you.

## ActionCreator

```javascript
createAction(
  type: string,
  payloadCreator: function = identity,
  { name: string = 'payload', meta: function },
);
```

This little util is inspired by [`redux actions`](https://github.com/acdlite/redux-actions). This
tool is a little simpler and less prescriptive and does not enforce the [FSA
pattern](https://github.com/acdlite/flux-standard-action). It also does not replicate the other
helper functions `redux actions` provides.

A lot actions often wind up looking similar, so this helper cuts down on some code for the most
basic case (similar to redux-actions).

In it's simplest form, you just call `createAction()` with your constant, and it will return an
action creator with an identity function.

```javascript
const ACTION = 'ACTION';
const act = createAction(ACTION);

expect(act('test')).toEqual({ type: ACTION, payload: 42 });
```

The `name` field allows you to override the named of the member that the payloadCreator funcion
returns to (defaults to `payload`). The `meta` field is an optional function that creates metadata
for the payload. It receives the same arguments as the payload creator, but its result becomes the
meta field of the resulting action. If metaCreator is undefined or not a function, the meta field is
omitted.

I'm still not entirely sure how useful this helper function is and will likely end up updating the
tool to directly add an action creator (without a helper function) and put adding the helper library
behind a flag.

## Installation

### Project Specific
First run:
```bash
npm i redux-boilerplate-helpers
# or yarn add redux-boilerplate-helpers

```
then add the following to the `scripts` secion of your `package.json`

```javascript
{
  ...
  "scripts": {
    "rdxh": "rdxh"
  },
  ...
}
```

### Globally
```bash
npm i -g redux-boilerplate-helpers
npm i redux-boilerplate-helpers

# or yarn global add redux-boilerplate-helpers
# yarn add redux-boilerplate-helpers
```

## Usage

### Project Specific
Note that the `--dir` option requires a path relative to your project root. You can use `pwd` if you
want to run the tool in the directory you are currently in. This limitation is due to how `npm`
scripts work. If you'd like to use relative paths, the tool will need to be installed globally (see
next section).
```bash
npm run rdxh -- --dir path/to/folder actionName anotherAction --trailing-comma all --single-quote
# if you prefer to run it in the path you are currently in, you need to run
npm run rdxh -- --dir `pwd` actionName anotherAction --trailing-comma all --single-quote
```

### Globally
Installing the tool globaly allows you to use  a relative path for the `--dir` option.

```bash
rdxh --dir ./ actionName anotherAction --trailing-comma all -single-quote
```

## Roadmap
I created this to help with my specific use case. However, there are many different ways people
structure their code. With some changes, this tool should be able to support a majority of use
cases. A few quick future changes which could be useful include (but are not limited to):

- Ability to specify the exact location of each file (this includes support for people using the
ducks pattern).

- Add an option to insert the new code into the files without running it through `prettier`. This
would basically mean passing the formatting options directly to the `recast` print function.

- Provide a way to customize the default ActionCreators.

- Additional configuration options (TBD).


## Contributing

To set up the environment, clone the repository, install the dependencies and run the tests:
```bash
yarn
yarn test
```

Before you make a PR, please make sure you run:
```bash
yarn run format
```

This command runs `eslint` and `prettier` to esure that the PR conforms to the existing codebase.
