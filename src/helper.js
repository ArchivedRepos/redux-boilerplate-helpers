/* @flow */
import invariant from 'invariant';

export const identity = payload => payload;
const defaultName = 'payload';

const createAction = (
  type: string,
  payloadCreator: Function = identity,
  { name = defaultName, meta }: { name: string, meta: Function } = {},
) => {
  invariant(
    payloadCreator instanceof Function || payloadCreator === null,
    'payloadCreator should be a function',
  );
  return (...args) => {
    const payload = payloadCreator === null ? identity(...args) : payloadCreator(...args);
    const action = {
      type,
      [name]: payload,
    };

    const hasMeta = meta instanceof Function;
    if (hasMeta) action.meta = meta(...args);

    return action;
  };
};

export { createAction };
export default createAction;
