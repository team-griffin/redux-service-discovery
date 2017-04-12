import createEtcd from '@team-griffin/browser-etcd';
import * as messages from './messages';
import * as signals from './signals';
import { getKeys } from './repository';
import { combineEpics } from 'redux-observable';
import { getServiceDiscoveryHosts } from './selectors';
import { reduce, pipe } from 'ramda';
import isError from 'lodash.iserror';
// Adders
import 'rxjs/add/operator/catch';
// Static
import { concat as concatStatic } from 'rxjs/observable/concat';
// Binders
import { of } from 'rxjs/observable/of';
import { map } from 'rxjs/operator/map';
import { switchMap } from 'rxjs/operator/switchMap';

const etcdFactory = pipe(
  (store) => store.getState(),
  getServiceDiscoveryHosts,
  (hosts) => createEtcd(hosts, {
  }),
);

export const configure = (actions$) => {
  return actions$.ofType(signals.CONFIGURE)
    ::map(({
      payload,
    }) => {
      return messages.configured(payload.config);
    });
};

// eslint-disable-next-line no-underscore-dangle, no-shadow
export const _fetchServices = (etcdFactory, actions$, store) => {
  return actions$.ofType(signals.FETCH_SERVICES)
    ::switchMap(({
      payload,
    }) => {
      const fetchingMsgs = reduce((result, etcdKey) => {
        return [
          ...result,
          messages.fetching(etcdKey),
        ];
      }, [], payload.keys);

      const etcd = etcdFactory(store);

      const fetched$ = getKeys(payload.keys, etcd)
        ::switchMap((services) => {
          const msgs = reduce((results, data, key) => {
            if (isError(data) === true) {
              return [
                ...results,
                messages.fetchFailure(key, data),
              ];
            }

            return [
              ...results,
              messages.fetchSuccess(key, data.node),
            ];
          }, [], services);

          return of(...msgs, messages.fetchComplete(payload.keys));
        });

      return concatStatic(
        of(...fetchingMsgs),
        fetched$,
      );

    });
};

export const fetchServices = (...args) => {
  return _fetchServices(etcdFactory, ...args);
};

export const root = () => {
  return combineEpics(
    configure,
    fetchServices,
  );
};

export default root;


