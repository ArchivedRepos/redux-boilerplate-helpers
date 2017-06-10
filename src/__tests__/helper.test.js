/* eslint-env jest */
import { createAction } from '../helper';

describe('helper function', () => {
  it('creates an action with a given payloadCreator', () => {
    const TEST_ACTION = 'test/TEST_ACTION';
    const testAction = createAction(TEST_ACTION, (input1, input2) => input1 + input2);

    const result = testAction(3, 4);
    expect(result).toEqual({ type: TEST_ACTION, payload: 7 });
  });

  it('uses an identity function when no function is passed in', () => {
    const TEST_ACTION = 'test/TEST_ACTION';
    const testAction = createAction(TEST_ACTION);

    const result = testAction('test');
    expect(result).toEqual({ type: TEST_ACTION, payload: 'test' });
  });

  it('allows the name of the payload field to be renamed', () => {
    const TEST_ACTION = 'test/TEST_ACTION';
    const testAction = createAction(TEST_ACTION, null, { name: 'error' });

    const result = testAction(new Error('test'));
    expect(result).toEqual({ type: TEST_ACTION, error: new Error('test') });
  });

  it('allows a meta field to be added', () => {
    const TEST_ACTION = 'test/TEST_ACTION';
    const testAction = createAction(TEST_ACTION, null, { meta: (_, m) => m });

    const result = testAction(3, 'meta');
    expect(result).toEqual({ type: TEST_ACTION, payload: 3, meta: 'meta' });
  });
});
