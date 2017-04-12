import { createAction } from 'redux-actions';

// Action Types
const prefix = '@@TEAM_GRIFFIN/REDUX_SERVICE_DISCOVERY';
export const CONFIGURE = `${prefix}/S_CONFIGURE`;
export const FETCH_SERVICES = `${prefix}/S_FETCH_SERVICES`;

// Actions
export const configure = createAction(CONFIGURE, (config) => ({
  config,
}));
export const fetchServices = createAction(FETCH_SERVICES, (keys) => ({
  keys,
}));