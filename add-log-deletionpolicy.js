'use strict';

const nco = require('nco');
const semver = require('semver');

//values from https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-deletionpolicy.html
const validDeletionPolicies = ['Delete', 'Retain', 'Snapshot'];

class AwsAddLogDeletionPolicy {
  constructor(serverless, options) {
    if(!semver.satisfies(serverless.version, '>= 1.20.2')) {
      throw new Error('serverless-plugin-log-deletionpolicy requires serverless 1.20.2 or higher');
    }

    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
    this.hooks = {
      'package:createDeploymentArtifacts': this.beforeDeploy.bind(this),
    };
  }

  sanitizeDeletionPolicyValue(inputValue) {
    if(validDeletionPolicies.includes(inputValue)) {
      return inputValue;
    } else {
      throw new Error(`DeletionPolicy value must be one of ${validDeletionPolicies}`);
    }
  }

  addLogDeletionPolicyForFunctions(globalLogDeletionPolicy) {
    const service = this.serverless.service;
    if(typeof service.functions !== 'object') {
      return;
    }

    const resources = nco(service.resources, {});
    resources.Resources = nco(resources.Resources, {});

    Object.keys(service.functions).forEach(functionName => {
      const localLogDeletionPolicy = nco(service.functions[functionName].logDeletionPolicy, null);
      if(localLogDeletionPolicy === null && globalLogDeletionPolicy === null) {
        return;
      }
      const functionLogDeletionPolicy = localLogDeletionPolicy === null ? globalLogDeletionPolicy : this.sanitizeDeletionPolicyValue(localLogDeletionPolicy);
      const logGroupLogicalId = this.provider.naming.getLogGroupLogicalId(functionName);

      const resource = {
        Type: 'AWS::Logs::LogGroup',
        Properties: {
          DeletionPolicy: functionLogDeletionPolicy
        }
      };
      resources.Resources[logGroupLogicalId] = resource;
    });
  }

  beforeDeploy() {
    const service = this.serverless.service;
    const globalLogDeletionPolicy = service.custom && service.custom.logDeletionPolicy
      ? this.sanitizeDeletionPolicyValue(service.custom.logDeletionPolicy)
      : null;
    this.addLogDeletionPolicyForFunctions(globalLogDeletionPolicy);
  }
}

module.exports = AwsAddLogDeletionPolicy;
