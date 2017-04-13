import { configureEpic, _fetchServiceEpic, fetchServicesEpic, rootEpic, completeFetchServicesEpic } from '../epics';
import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import { createEpicMiddleware, combineEpics } from 'redux-observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { ignoreElements } from 'rxjs/operator/ignoreElements';
import { skip } from 'rxjs/operator/skip';
import { take } from 'rxjs/operator/take';
import { _do as execute } from 'rxjs/operator/do';
import * as signals from '../signals';
import * as messages from '../messages';
import sinon from 'sinon';
import after from 'lodash.after';

const createDebugEpic = () => {
  const subject = new ReplaySubject();

  return {
    debugSubject: subject,
    debugEpic: (actions$) => {
      return actions$
        ::execute((action) => {
          subject.next(action);
        })
        ::ignoreElements();
    }
  };
};


describe('epics', function() {
  beforeEach(function() {
    const {
      debugSubject,
      debugEpic,
    } = createDebugEpic();

    this.debugSubject = debugSubject;
    this.debugEpic = debugEpic;
  });

  describe('::configureEpic', function() {
    beforeEach(function() {
      const epicMiddleware = createEpicMiddleware(
        combineEpics(
          this.debugEpic,
          configureEpic,
        )
      );

      const mockStore = configureMockStore([ epicMiddleware ]);
      this.store = mockStore();
    });

    it('maps the CONFIGURE signal to CONFIGURED message', function(done) {
      this.debugSubject::skip(1)::take(1).subscribe((action) => {
        expect(action.type).to.eql(messages.configured({ foo: 'bar' }).type);
        done();
      });

      this.store.dispatch(signals.configure({ foo: 'bar' }));
    });

    it('puts the signal config into the message config', function(done) {
      this.debugSubject::skip(1)::take(1).subscribe((action) => {
        expect(action.payload).to.eql(messages.configured({ foo: 'bar' }).payload);
        done();
      });

      this.store.dispatch(signals.configure({ foo: 'bar' }));
    });
  });

  describe('::_fetchServiceEpic', function() {
    beforeEach(function() {

    });

    context('when the fetch is successful', function() {
      beforeEach(function() {
        this.etcd = {
          get: () => {
            return new Promise((resolve) => {
              resolve({
                node: {
                  foo: 'bar',
                }
              });
            });
          }
        };

        const epicMiddleware = createEpicMiddleware(
          combineEpics(
            this.debugEpic,
            _fetchServiceEpic.bind(null, () => this.etcd),
          )
        );

        const mockStore = configureMockStore([ epicMiddleware ]);
        this.store = mockStore();
      });

      it('emits a FETCHING message', function(done) {
        this.debugSubject::skip(1)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetching('foo'));
          done();
        });

        this.store.dispatch(signals.fetchService('foo'));
      });

      it('emits a FETCH_SUCCESS message with node', function(done) {
        this.debugSubject::skip(2)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetchSuccess('foo', { foo: 'bar' }));
          done();
        });

        this.store.dispatch(signals.fetchService('foo'));
      });
    });

    context('when the fetch is a failure', function() {
      beforeEach(function() {
        this.etcd = {
          get: () => {
            return new Promise((resolve, reject) => {
              reject(new Error('Foo'));
            });
          }
        };

        const epicMiddleware = createEpicMiddleware(
          combineEpics(
            this.debugEpic,
            _fetchServiceEpic.bind(null, () => this.etcd),
          )
        );

        const mockStore = configureMockStore([ epicMiddleware ]);
        this.store = mockStore();
      });

      it('emits a FETCHING message', function(done) {
        this.debugSubject::skip(1)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetching('foo'));
          done();
        });

        this.store.dispatch(signals.fetchService('foo'));
      });

      it('emits a FETCH_FAILURE message', function(done) {
        this.debugSubject::skip(2)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetchFailure('foo', new Error('Foo')));
          done();
        });

        this.store.dispatch(signals.fetchService('foo'));
      });    
    });
  });

  describe('::fetchServicesEpic', function() {
    beforeEach(function() {
      const epicMiddleware = createEpicMiddleware(
        combineEpics(
          this.debugEpic,
          fetchServicesEpic,
        )
      );

      const mockStore = configureMockStore([ epicMiddleware ]);
      this.store = mockStore();
    });

    it('emits FETCH_SERVICE signals for each key', function(done) {
      const vote = after(2, done);

      this.debugSubject::skip(1)::take(1).subscribe((action) => {
        expect(action).to.eql(signals.fetchService('foo'));
        vote();
      });

      this.debugSubject::skip(2)::take(1).subscribe((action) => {
        expect(action).to.eql(signals.fetchService('bar'));
        vote();
      });

      this.store.dispatch(signals.fetchServices(['foo', 'bar']));
    });
  });

  describe('::completeFetchServicesEpic', function() {
    beforeEach(function() {
      const epicMiddleware = createEpicMiddleware(
        combineEpics(
          this.debugEpic,
          completeFetchServicesEpic,
        )
      );

      const mockStore = configureMockStore([ epicMiddleware ]);
      this.store = mockStore();
    });

    context('when all are successful', function() {
      it('emits a FETCH_COMPLETE after all other emits', function(done) {
        this.debugSubject::skip(3)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetchComplete(['foo', 'bar']));
          done();
        });

        this.store.dispatch(signals.fetchServices(['foo', 'bar']));
        setTimeout(() => {
          this.store.dispatch(messages.fetchSuccess('foo', {}));
          this.store.dispatch(messages.fetchSuccess('bar', {}));
        }, 0);
      });
    });

    context('when all are fails', function() {
      it('emits a FETCH_COMPLETE after all other emits', function(done) {
        this.debugSubject::skip(3)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetchComplete(['foo', 'bar']));
          done();
        });

        this.store.dispatch(signals.fetchServices(['foo', 'bar']));
        setTimeout(() => {
          this.store.dispatch(messages.fetchFailure('foo', new Error('foo')));
          this.store.dispatch(messages.fetchFailure('bar', new Error('bar')));
        }, 0);
      });
    });

    context('when mixed results', function() {
      it('emits a FETCH_COMPLETE after all other emits', function(done) {
        this.debugSubject::skip(3)::take(1).subscribe((action) => {
          expect(action).to.eql(messages.fetchComplete(['foo', 'bar']));
          done();
        });

        this.store.dispatch(signals.fetchServices(['foo', 'bar']));
        setTimeout(() => {
          this.store.dispatch(messages.fetchSuccess('foo', {}));
          this.store.dispatch(messages.fetchFailure('bar', new Error('bar')));
        }, 0);
      });
    });

  });

  describe('::rootEpic', function() {

  });
});