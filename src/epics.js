import createEtcd from '@team-griffin/browser-etcd';
import * as messages from './messages';
import * as signals from './signals';
import { getKey } from './repository';
import { combineEpics } from 'redux-observable';
import { getServiceDiscoveryHosts } from './selectors';
import { reduce, pipe } from 'ramda';
import isError from 'lodash.iserror';
// Adders
import 'rxjs/add/operator/catch';
// Static
import { concat as concatStatic } from 'rxjs/observable/concat';
import { merge as mergeStatic } from 'rxjs/observable/merge';
// Binders
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';
import { skip } from 'rxjs/operator/skip';
import { take } from 'rxjs/operator/take';

const etcdFactory = pipe(
  (store) => store.getState(),
  getServiceDiscoveryHosts,
  (hosts) => createEtcd(hosts, {
  }),
);

export const configureEpic = (actions$) => {
  return actions$.ofType(signals.CONFIGURE)
    ::map(({
      payload,
    }) => {
      return messages.configured(payload.config);
    });
};

export const _fetchServiceEpic = (etcdFactory, actions$, store) => {
  return actions$.ofType(signals.FETCH_SERVICE)
    ::switchMap((action) => {
      const {
        key
      } = action.payload;

      const etcd = etcdFactory(store);

      const fetched$ = getKey(etcd, key)
        ::map((data) => {
          return messages.fetchSuccess(key, data.node);
        })
        .catch((err) => {
          return of(messages.fetchFailure(key, err));
        });

      return concatStatic(
        of(messages.fetching(key)),
        fetched$,
      );
    });
};

// eslint-disable-next-line no-underscore-dangle, no-shadow
export const fetchServicesEpic = (actions$, store) => {
  return actions$.ofType(signals.FETCH_SERVICES)
    ::switchMap(({
      payload,
    }) => {
      const {
        keys
      } = payload;

      const fetchSignals = reduce((acc, key) => {
        return [
          ...acc,
          signals.fetchService(key),
        ];
      }, [], keys);

      return of(...fetchSignals);
    });
};

export const completeFetchServicesEpic = (actions$) => {
  return actions$.ofType(signals.FETCH_SERVICES)
    ::switchMap(({ payload }) => {
      const {
        keys
      } = payload;

      return actions$
        .ofType(
          messages.FETCH_SUCCESS,
          messages.FETCH_FAILURE,
        )
        ::skip(keys.length - 1)
        ::take(1)
        ::map(() => {
          return messages.fetchComplete(keys);
        });
    });
};

export const fetchServiceEpic = (...args) => {
  return _fetchServiceEpic(etcdFactory, ...args);
};

export const rootEpic = () => {
  return combineEpics(
    configureEpic,
    completeFetchServicesEpic,
    fetchServiceEpic,
    fetchServicesEpic,
  );
};

export default rootEpic;


