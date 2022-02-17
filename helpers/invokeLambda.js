const aws = require('aws-sdk');

const invokeLambda = async (functionName, content) => {
  const endpoint = `http://localhost:${process.env.NON_API_PORT}`;
  const lambda = new aws.Lambda({
    apiVersion: '2015-03-31',
    endpoint,
    sslEnabled: false,
    region: 'us-east-1',
  });

  const invocationType = 'RequestResponse';

  const invokeParams = {
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: JSON.stringify({
      Records: [
        {
          body: content,
        },
      ],
    }),
  };

  lambda.invoke(invokeParams, () => { });
  await (new Promise((resolve) => setTimeout(resolve, 100))); // small delay to let lambda be invoked
};
const invokeLambdaScheduledActions = async (functionName, content) => {
  const endpoint = `http://localhost:${process.env.NON_API_PORT}`;
  const lambda = new aws.Lambda({
    apiVersion: '2015-03-31',
    endpoint,
    sslEnabled: false,
    region: 'us-east-1',
  });

  const invocationType = 'RequestResponse';

  const invokeParams = {
    FunctionName: functionName,
    InvocationType: invocationType,
    Payload: JSON.stringify({
      Records: [
        content,
      ],
    }),
  };

  lambda.invoke(invokeParams, () => { });
  await (new Promise((resolve) => setTimeout(resolve, 100))); // small delay to let lambda be invoked
};
module.exports = {
  invokeLambda,
  invokeLambdaScheduledActions,
};
