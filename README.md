# serverless-plugin-log-deletionpolicy
Control the deletion policy of your serverless function's cloudwatch logs.

## Usage example
`serverless.yml`

```yml
service: sample

plugins:
  - serverless-plugin-log-deletionpolicy

provider:
  name: aws

custom:
  logDeletionPolicy: Retain # used to set a global value for all functions

functions:
  function1:
  function2:
    logDeletionPolicy: Retain # set the deletion policy for specific log group
```
