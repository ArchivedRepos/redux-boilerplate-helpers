// @flow
import invariant from 'invariant';

export const identity = <I>(payload: I): I => payload;
const defaultName = 'payload';

type Action<A> = {|
  type: string,
  [key: string]: A,
  meta?: mixed,
|};

const createAction = <A, P: Array<*>>(
  type: string,
  payloadCreator: null | (...args: P) => A = identity,
  { name = defaultName, meta }: { name: string, meta?: Function } = {},
): ((...args: P) => Action<A>) => {
  invariant(
    payloadCreator instanceof Function || payloadCreator === null,
    'payloadCreator should be a function',
  );
  return (...args) => {
    const payload = payloadCreator === null ? identity(...args) : payloadCreator(...args);
    const action: Action<*> = {
      type,
      [name]: payload,
    };

    if (meta instanceof Function) {
      action.meta = meta(...args);
    }

    return action;
  };
};

export { createAction };
export default createAction;
