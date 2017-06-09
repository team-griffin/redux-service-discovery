import { createAction } from 'redux-actions';

// Action Types
const prefix = '@@TEAM_GRIFFIN/REDUX_SERVICE_DISCOVERY';
export const CONFIGURED = `${prefix}/M_CONFIGURED`;
export const FETCHING = `${prefix}/M_FETCHING`;
export const FETCH_SUCCESS = `${prefix}/M_FETCH_SUCCESS`;
export const FETCH_FAILURE = `${prefix}/M_FETCH_FAILURE`;
export const FETCH_COMPLETE = `${prefix}/M_FETCH_COMPLETE`;

// Actions
export const configured = createAction(CONFIGURED, (config) => ({
  config,
}));
export const fetching = createAction(FETCHING, (key) => ({
  key,
}));
export const fetchSuccess = createAction(FETCH_SUCCESS, (key, node) => ({
  key,
  node,
}));
export const fetchFailure = createAction(FETCH_FAILURE, (key, error) => ({
  key,
  error,
}));
export const fetchComplete = createAction(FETCH_COMPLETE, (keys) => ({
  keys,
}));
