import {
  TEST_ACTION,
  ANOTHER_ACTION,
} from './constants';

const initialState = {};

function testReducer(state = initialState, action) {
  switch(action.type) {
    case TEST_ACTION:
      return { ...state, test: 10 };
    case ANOTHER_ACTION:
      return { ...state, another: 'test' };
    default:
      return state;
  }
}

export default testReducer;
