'use strict';

const expect = require('chai').expect;
const sinon = require('sinon');

const AwsAddLogDeletionPolicy = require('../add-log-deletionpolicy');

function createTestInstance(options) {
  options = options || {};
  return new AwsAddLogDeletionPolicy({
    version: options.version || '1.20.2',
    service: {
      provider: options.provider || {},
      functions: options.functions,
      resources: options.resources ? { Resources: options.resources } : undefined
    },
    getProvider: () => {
      return {
        naming: {
          getLogGroupLogicalId(functionName) {
            return `${functionName.charAt(0).toUpperCase()}${functionName.slice(1)}LogGroup`; //TODO: dash/underscore replacement?
          }
        }
      }
    }
  }, {});
}

describe('serverless-plugin-log-deletionpolicy', function() {
  describe('#constructor', function() {
    it('should throw on older version', function() {
      expect(() => createTestInstance({version: '1.20.1'}))
        .to.throw('serverless-plugin-log-deletionpolicy requires serverless 1.20.2 or higher');
    });

    it('should create hooks', function() {
      const instance = createTestInstance();
      expect(instance)
        .to.have.property('hooks')
        .that.has.all.keys('package:createDeploymentArtifacts');

      const stub = sinon.stub(instance, 'addLogDeletionPolicyForFunctions');
      instance.hooks['package:createDeploymentArtifacts']();

      sinon.assert.calledOnce(stub);
    });
  })

});
