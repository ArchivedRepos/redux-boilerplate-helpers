import { createAction } from 'redux-boilerplate-helpers';
import {
  TEST_ACTION,
  ANOTHER_ACTION,
} from './constants';


export const testAction = createAction(TEST_ACTION);
export const anotherAction = createAction(ANOTHER_ACTION);
