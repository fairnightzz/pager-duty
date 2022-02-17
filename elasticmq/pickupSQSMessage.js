/* eslint-disable no-console */
const aws = require('aws-sdk');
const { invokeLambda } = require('../helpers/invokeLambda');

const myCredentials = new aws.Credentials('x', 'x');

const sqs = new aws.SQS({
  apiVersion: '2012-11-05',
  credentials: myCredentials,
  region: 'none',
  endpoint: `http://localhost:${process.env.SQS_PORT}`,

});

const actionsQueue = async (queues) => {
  const currentURL = queues.QueueUrls.find((url) => url.includes('Workflow_Action_Runs'));
  const params = {
    QueueUrl: `${currentURL}`,
  };
  const message = await sqs.receiveMessage(params).promise();

  if (!message.Messages?.length) {
    return;
  }
  console.log('Actions Queue');

  const receipt = message.Messages[0].ReceiptHandle;

  const body = message.Messages[0].Body;

  await invokeLambda('runWorkflowActions', body);
  sqs.deleteMessage({ QueueUrl: currentURL, ReceiptHandle: receipt }, () => { console.log('message deleted'); });
};

const webActionsQueue = async (queues) => {
  const currentURL = queues.QueueUrls.find((url) => url.includes('Workflow_Action_Web'));
  const params = {
    QueueUrl: `${currentURL}`,
  };
  const message = await sqs.receiveMessage(params).promise();

  if (!message.Messages?.length) {
    return;
  }

  console.log('webActions Queue');

  const receipt = message.Messages[0].ReceiptHandle;

  const body = message.Messages[0].Body;

  await invokeLambda('runWorkflowActionsWeb', body);
  sqs.deleteMessage({ QueueUrl: currentURL, ReceiptHandle: receipt }, () => { console.log('message deleted'); });
};

const pickupSQSMessages = async () => {
  try {
    const queues = await sqs.listQueues().promise();
    await actionsQueue(queues);
    await webActionsQueue(queues);
  } catch (err) {
    console.log(err.message);
  }
};

setInterval(() => pickupSQSMessages(), 2000);
