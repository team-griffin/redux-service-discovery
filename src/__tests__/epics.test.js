import * as epics from '../epics';
import { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import * as signals from '../signals';
import * as messages from '../messages';
import sinon from 'sinon';
import * as most from 'most';
import * as r from 'ramda';

describe('epics', function() {
  describe('::configureEpic', function() {
    beforeEach(function() {
      const mockStore = configureMockStore([]);
      this.store = mockStore();
    });

    it('maps the CONFIGURE signal to CONFIGURED message', function(done) {
      const actions$ = most.of(signals.configure({ foo: 'bar' }));
      const epic$ = epics.configureEpic(actions$);

      epic$.reduce((acc, x) => r.append(x)(acc), []).then((actions) => {
        expect(actions).to.have.length(1);
        expect(actions[0].type).to.eql(messages.configured({ foo: 'bar' }).type);
        done();
      }, done);
    });

    // it('puts the signal config into the message config', function(done) {
    //   this.debugSubject::skip(1)::take(1).subscribe((action) => {
    //     expect(action.payload).to.eql(messages.configured({ foo: 'bar' }).payload);
    //     done();
    //   });

    //   this.store.dispatch(signals.configure({ foo: 'bar' }));
    // });
  });

//   describe('::_fetchServiceEpic', function() {
//     beforeEach(function() {

//     });

//     context('when the fetch is successful', function() {
//       beforeEach(function() {
//         this.etcd = {
//           get: () => {
//             return new Promise((resolve) => {
//               resolve({
//                 node: {
//                   foo: 'bar',
//                 }
//               });
//             });
//           }
//         };

//         const epicMiddleware = createEpicMiddleware(
//           combineEpics(
//             this.debugEpic,
//             _fetchServiceEpic.bind(null, () => this.etcd),
//           )
//         );

//         const mockStore = configureMockStore([ epicMiddleware ]);
//         this.store = mockStore();
//       });

//       it('emits a FETCHING message', function(done) {
//         this.debugSubject::skip(1)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetching('foo'));
//           done();
//         });

//         this.store.dispatch(signals.fetchService('foo'));
//       });

//       it('emits a FETCH_SUCCESS message with node', function(done) {
//         this.debugSubject::skip(2)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetchSuccess('foo', { foo: 'bar' }));
//           done();
//         });

//         this.store.dispatch(signals.fetchService('foo'));
//       });
//     });

//     context('when the fetch is a failure', function() {
//       beforeEach(function() {
//         this.etcd = {
//           get: () => {
//             return new Promise((resolve, reject) => {
//               reject(new Error('Foo'));
//             });
//           }
//         };

//         const epicMiddleware = createEpicMiddleware(
//           combineEpics(
//             this.debugEpic,
//             _fetchServiceEpic.bind(null, () => this.etcd),
//           )
//         );

//         const mockStore = configureMockStore([ epicMiddleware ]);
//         this.store = mockStore();
//       });

//       it('emits a FETCHING message', function(done) {
//         this.debugSubject::skip(1)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetching('foo'));
//           done();
//         });

//         this.store.dispatch(signals.fetchService('foo'));
//       });

//       it('emits a FETCH_FAILURE message', function(done) {
//         this.debugSubject::skip(2)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetchFailure('foo', new Error('Foo')));
//           done();
//         });

//         this.store.dispatch(signals.fetchService('foo'));
//       });    
//     });
//   });

  describe('::fetchServicesEpic', function() {
    beforeEach(function() {
      const mockStore = configureMockStore([]);
      this.store = mockStore();
    });

    it('emits FETCH_SERVICE signals for each key', function(done) {
      const actions$ = most.of(signals.fetchServices(['foo', 'bar']));
      const epic$ = epics.fetchServicesEpic(actions$);

      epic$.reduce((acc, x) => r.append(x)(acc), []).then((actions) => {
        expect(actions).to.have.length(2);
        expect(actions[0]).to.eql(signals.fetchService('foo'));
        expect(actions[1]).to.eql(signals.fetchService('bar'));
        done();
      }, done);
    });
  });

//   describe('::completeFetchServicesEpic', function() {
//     beforeEach(function() {
//       const epicMiddleware = createEpicMiddleware(
//         combineEpics(
//           this.debugEpic,
//           completeFetchServicesEpic,
//         )
//       );

//       const mockStore = configureMockStore([ epicMiddleware ]);
//       this.store = mockStore();
//     });

//     context('when all are successful', function() {
//       it('emits a FETCH_COMPLETE after all other emits', function(done) {
//         this.debugSubject::skip(3)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetchComplete(['foo', 'bar']));
//           done();
//         });

//         this.store.dispatch(signals.fetchServices(['foo', 'bar']));
//         setTimeout(() => {
//           this.store.dispatch(messages.fetchSuccess('foo', {}));
//           this.store.dispatch(messages.fetchSuccess('bar', {}));
//         }, 0);
//       });
//     });

//     context('when all are fails', function() {
//       it('emits a FETCH_COMPLETE after all other emits', function(done) {
//         this.debugSubject::skip(3)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetchComplete(['foo', 'bar']));
//           done();
//         });

//         this.store.dispatch(signals.fetchServices(['foo', 'bar']));
//         setTimeout(() => {
//           this.store.dispatch(messages.fetchFailure('foo', new Error('foo')));
//           this.store.dispatch(messages.fetchFailure('bar', new Error('bar')));
//         }, 0);
//       });
//     });

//     context('when mixed results', function() {
//       it('emits a FETCH_COMPLETE after all other emits', function(done) {
//         this.debugSubject::skip(3)::take(1).subscribe((action) => {
//           expect(action).to.eql(messages.fetchComplete(['foo', 'bar']));
//           done();
//         });

//         this.store.dispatch(signals.fetchServices(['foo', 'bar']));
//         setTimeout(() => {
//           this.store.dispatch(messages.fetchSuccess('foo', {}));
//           this.store.dispatch(messages.fetchFailure('bar', new Error('bar')));
//         }, 0);
//       });
//     });

//   });

//   describe('::rootEpic', function() {

//   });
});