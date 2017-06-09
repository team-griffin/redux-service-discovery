import * as messages from '../messages';
import { expect } from 'chai';

describe('messages', function() {
  describe('configured', function() {
    it('puts the config into the payload', function() {
      const action = messages.configured({ foo: 'bar' });
      expect(action.payload).to.eql({ config: { foo: 'bar' } });
    });

    it('has the CONFIGURED type');
  });
  describe('fetching', function() {
    it('puts the key into the payload');
    it('has the FETCHING type');
  });
  describe('fetchSuccess', function() {
    it('puts the key into the payload');
    it('puts the node into the payload');
    it('has the FETCH_SUCCESS type');
  });
  describe('fetchFailure', function() {
    it('puts the key into the payload');
    it('puts the error into the action');
    it('has the FETCH_FAILURE type');
  });
  describe('fetchComplete', function() {
    it('puts the keys into the payload');
    it('has the FETCH_COMPLETE type');
  });
});
