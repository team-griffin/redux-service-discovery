import { fromPromise } from 'rxjs/observable/fromPromise';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/catch';
import { map as rMap, reduce } from 'ramda';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { map } from 'rxjs/operator/map';

export const getKey = (etcd, key) => {
  return fromPromise(etcd.get(key));
};

export const getKeys = (etcd, keys) => {
  const obs = rMap((key) => {
    return getKey(key, etcd)
      .catch((err) => {
        return of(err);
      });
  }, keys);

  return forkJoin(...obs)::map((values) => {
    return reduce((result, value, index) => {
      return {
        ...result,
        [keys[index]]: value,
      };
    }, {
    }, values);
  });
};