import { createReducer } from 'redux-create-reducer';
import * as messages from './messages';
import { pipe, merge, __, evolve, always } from 'ramda';

export const initialState = {
  config: {
  },
  services: {
  },
};

const serviceShell = {
  fetching: false,
  node: null,
  error: null,
};

export default createReducer(initialState, {
  [messages.CONFIGURED]: (state, action) => evolve({
    config: always(action.payload.config),
  })(state),

  [messages.FETCHING]: (state, action) => evolve({
    services: {
      [action.payload.key]: pipe(
        merge(__, serviceShell),
        merge(__, {
          fetching: true,
        }),
      ),
    },
  })(state),

  [messages.FETCH_SUCCESS]: (state, action) => evolve({
    services: {
      [action.payload.key]: merge(__, {
        fetching: false,
        node: action.payload.node,
      }),
    },
  })(state),

  [messages.FETCH_FAILURE]: (state, action) => evolve({
    services: {
      [action.payload.key]: merge(__, {
        fetching: false,
        node: null,
        error: action.payload.error,
      }),
    },
  })(state),
});