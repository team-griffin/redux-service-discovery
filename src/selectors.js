import { createSelector } from 'reselect';
import { reduce } from 'ramda';

export const getServiceDiscovery = (state) => {
  return state.serviceDiscovery;
};

export const getServiceDiscoveryConfig = createSelector(
  getServiceDiscovery,
  (sd) => {
    return sd.config;
  }
);

export const getServiceDiscoveryHosts = createSelector(
  getServiceDiscoveryConfig,
  (config) => {
    return config.hosts;
  }
);

export const getRawServices = createSelector(
  getServiceDiscovery,
  (sd) => {
    return sd.services;
  }
);

export const getKeyValueServices = createSelector(
  getRawServices,
  reduce((results, service, key) => {
    return {
      ...results,
      [key]: service.node.value,
    };
  }, {
  }),
);