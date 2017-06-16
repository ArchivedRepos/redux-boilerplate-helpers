// @flow
import invariant from 'invariant';

export const identity = (payload: any): any => payload;
const defaultName = 'payload';

type Action = {
  type: string,
  [key: string]: any,
  meta?: any,
};

const createAction = (
  type: string,
  payloadCreator: Function = identity,
  { name = defaultName, meta }: { name: string, meta: Function } = {},
) => {
  invariant(
    payloadCreator instanceof Function || payloadCreator === null,
    'payloadCreator should be a function',
  );
  return (...args: any) => {
    const payload = payloadCreator === null ? identity(...args) : payloadCreator(...args);
    const action: Action = {
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
