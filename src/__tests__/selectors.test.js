import { expect } from 'chai';
import * as selectors from '../selectors';

describe('selectors', function() {
  describe('::getServiceDiscovery', function() {
    it('returns the service discovery namespace', function() {
      const result = selectors.getServiceDiscovery({
        serviceDiscovery: { foo: 'bar' },
      });

      expect(result).to.eql({ foo: 'bar' });
    });
  });

  describe('::getServiceDiscoveryConfig', function() {
    it('returns the config', function() {
      const result = selectors.getServiceDiscoveryConfig({
        serviceDiscovery: { config: { foo: 'bar' } },
      });

      expect(result).to.eql({ foo: 'bar' });
    });
  });

  describe('::getServiceDiscoveryHosts', function() {
    it('returns the hosts in the config', function() {
      const result = selectors.getServiceDiscoveryHosts({
        serviceDiscovery: { config: { hosts: ['foo'] } },
      });

      expect(result).to.eql(['foo']);
    });
  });

  describe('::getRawServices', function() {
    it('returns the hosts in the config', function() {
      const result = selectors.getRawServices({
        serviceDiscovery: { services: { foo: 'bar' } },
      });

      expect(result).to.eql({ foo: 'bar' });
    });
  });

  describe('::getKeyValueServices', function() {
    it('returns the hosts in the config', function() {
      const result = selectors.getKeyValueServices({
        serviceDiscovery: {
          services: {
            foo: { node: { value: 'bar' } },
            baz: { node: { value: 'qux' } },
          }
        },
      });

      expect(result).to.eql({ foo: 'bar', baz: 'qux' });
    });
  });
});
