import reducer, { initialState } from '../reducer';
import * as messages from '../messages';
import { expect } from 'chai';
import { compose, __, curry } from 'ramda';

describe('reducer', function() {
  describe('INIT', function() {
    it('sets to the initial state', function() {
      const state = reducer(void 0, {});
      expect(state).to.eql(initialState);
    });
  });

  describe('CONFIGURED', function() {
    it('set config', function() {
      const state = reducer(initialState, messages.configured({
        foo: 'bar',
      }));

      expect(state.config).to.eql({
        foo: 'bar',
      });
    });

    it('does not merge (overwrites)', function() {
      const state = reducer({
        config: {
          foo: 'bar',
        },
      }, messages.configured({
        bar: 'baz',
      }));

      expect(state.config).to.eql({
        bar: 'baz',
      });     
    });
  });

  describe('FETCHING', function() {
    it('adds the key to services', function() {
      const state = reducer(initialState, messages.fetching('foo'));

      expect(state.services).to.include.keys('foo');
    });

    it('creates a service scope', function() {
      const state = reducer(initialState, messages.fetching('foo'));

      expect(state.services.foo).to.eql({
        fetching: true,
        node: null,
        error: null,
      });
    });

    it('sets the service scope to fetching', function() {
      const state = reducer(initialState, messages.fetching('foo'));

      expect(state.services.foo.fetching).to.be.true;   
    });
  });

  describe('FETCH_SUCCESS', function() {
    it('is no longer fetching', function() {
      const curriedReducer = curry(reducer);

      const state = compose(
        curriedReducer(__, messages.fetchSuccess('foo', { bar: 'baz' })),
        curriedReducer(__, messages.fetching('foo')),
      )(initialState);

      expect(state.services.foo.fetching).to.be.false; 
    });

    it('sets the node from the payload', function() {
      const curriedReducer = curry(reducer);

      const state = compose(
        curriedReducer(__, messages.fetchSuccess('foo', { bar: 'baz' })),
        curriedReducer(__, messages.fetching('foo')),
      )(initialState);

      expect(state.services.foo.node).to.eql({ bar: 'baz' }); 
    });
  });

  describe('FETCH_FAILURE', function() {
    it('is no longer fetching', function() {
      const curriedReducer = curry(reducer);

      const state = compose(
        curriedReducer(__, messages.fetchFailure('foo', { bar: 'baz' })),
        curriedReducer(__, messages.fetching('foo')),
      )(initialState);

      expect(state.services.foo.fetching).to.be.false; 
    });

    it('sets the error from the payload', function() {
      const curriedReducer = curry(reducer);
      const error = new Error('test');

      const state = compose(
        curriedReducer(__, messages.fetchFailure('foo', error)),
        curriedReducer(__, messages.fetching('foo')),
      )(initialState);

      expect(state.services.foo.error).to.eql(error); 
    });
  });
});
