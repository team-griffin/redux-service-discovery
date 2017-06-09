import { create } from '@most/create';
import { indexBy, path } from 'ramda';

export const fromColdPromise = (f) => {
  return create((add, end, error) => {
    const promise = f();

    return promise.then((data) => {
      add(data);
      end();
    }, error);
  });
};

export const indexNodesByKey = indexBy(path(['node', 'key']));
