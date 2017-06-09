import createEtcd from '@team-griffin/browser-etcd';
import * as messages from './messages';
import * as signals from './signals';
import { getKey } from './repository';
import { combineEpics, select, selectArray } from 'redux-most';
import { getServiceDiscoveryHosts } from './selectors';
import isError from 'lodash.iserror';
import * as r from 'ramda';
import * as most from 'most';

const etcdFactory = r.pipe(
  (store) => store.getState(),
  getServiceDiscoveryHosts,
  (hosts) => createEtcd(hosts, {
  }),
);

const mmapc = r.curry(most.map);
const mstartWithc = r.curry(most.startWith);
const mrecoverWithc = r.curry(most.recoverWith);
const mskipc = r.curry(most.skip);
const mtakec = r.curry(most.take);

export const configureEpic = (actions$) => r.pipe(
  select(signals.CONFIGURE),
  mmapc((action) => messages.configured(action.payload.config)),
)(actions$);

export const _fetchServiceEpic = (
  etcdFactory,
  actions$,
  store
) => r.pipe(
  select(signals.FETCH_SERVICE),
  mmapc(({
    payload: {
      key,
    },
  }) => {
    const etcd = etcdFactory(store);

    const item$ = getKey(etcd, key);
    const keyedFetchSuccess = r.partial(messages.fetchSuccess, [key]);
    const keyedFetchFailure = r.partial(messages.fetchFailure, [key]);

    return r.pipe(
      mmapc((item) => keyedFetchSuccess(item.node)),
      mrecoverWithc((err) => most.of(keyedFetchFailure(err))),
      mstartWithc(messages.fetching(key)),
    )(item$);
  }),
  most.join,
)(actions$);

// eslint-disable-next-line no-underscore-dangle, no-shadow
export const fetchServicesEpic = (
  actions$,
  store
) => r.pipe(
  select(signals.FETCH_SERVICES),
  mmapc(({
    payload: {
      keys,
    },
  }) => {
    const fetchSignals = r.map(signals.fetchService)(keys);
    return most.from(fetchSignals);
  }),
  most.switchLatest,
)(actions$);

export const completeFetchServicesEpic = (actions$) => r.pipe(
  select(signals.FETCH_SERVICES),
  mmapc(({
    payload: {
      keys,
    }
  }) => {
    const fetchCompleteForKeys = r.partial(messages.fetchComplete, [keys]);

    return r.pipe(
      selectArray([
        messages.FETCH_SUCCESS,
        messages.FETCH_FAILURE
      ]),
      mskipc(keys.length - 1),
      mtakec(1),
      mmapc(fetchCompleteForKeys),
    )(actions$);
  }),
  most.switchLatest,
)(actions$);

export const fetchServiceEpic = (...args) => {
  return _fetchServiceEpic(etcdFactory, ...args);
};

export const rootEpic = () => {
  return combineEpics([
    configureEpic,
    completeFetchServicesEpic,
    fetchServiceEpic,
    fetchServicesEpic,
  ]);
};
