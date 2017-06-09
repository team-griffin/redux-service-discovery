import { fromColdPromise } from './utils';
import * as most from 'most';
import * as r from 'ramda';

const mmapc = r.curry(most.map);
const reduceIndexed = r.addIndex(r.reduce);

export const getKey = (etcd, key) => {
  return fromColdPromise(() => etcd.get(key));
};

export const getKeys = (etcd, keys) => {
  const observables = r.map((key) => getKey(key, etcd))(keys);

  return r.pipe(
    most.combineArray(Array.of),
  )(observables);
};