const aws = require('aws-sdk');

const myCredentials = new aws.Credentials('x', 'x');

const sqs = new aws.SQS({
  apiVersion: '2012-11-05',
  credentials: myCredentials,
  region: 'none',
  endpoint: `http://localhost:${process.env.SQS_PORT}`,
});

(async () => {
  const queues = await sqs.listQueues().promise();

  const currentURL = queues.QueueUrls[0];
  console.log({ currentURL });

  const val = Math.floor(Math.random() * 100).toString();
  console.log('random value ', val);
  const params = {
    MessageBody: JSON.stringify({ test: val }),
    QueueUrl: `${currentURL}`,
  };
  const msgRes = await sqs.sendMessage(params).promise();
  console.log(msgRes);
})();
