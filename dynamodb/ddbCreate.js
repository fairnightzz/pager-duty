const aws = require('aws-sdk');

const endpointUrl = `http://localhost:${process.env.DDB_PORT}`;

const createDBTable = async () => {
  const ddb = new aws.DynamoDB({
    apiVersion: '2012-08-10',
    region: process.env.DDB_LOCAL_REGION,
    endpoint: endpointUrl,
  });

  let params = {
    AttributeDefinitions: [
      {
        AttributeName: 'PK',
        AttributeType: 'S',
      },
      {
        AttributeName: 'SK',
        AttributeType: 'S',
      },
    ],
    KeySchema: [
      {
        AttributeName: 'PK',
        KeyType: 'HASH',
      },
      {
        AttributeName: 'SK',
        KeyType: 'RANGE',
      },
    ],
    BillingMode: 'PAY_PER_REQUEST',
    TableName: 'ScheduledActions',
    StreamSpecification: {
      StreamEnabled: true,
      StreamViewType: 'NEW_IMAGE',
    },
  };

  try {
    const response = await ddb.createTable(params).promise();
    console.log(response);
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }

  params = {
    TableName: 'ScheduledActions',
    TimeToLiveSpecification: {
      AttributeName: 'TTL',
      Enabled: true,
    },
  };

  const ttlRequest = await ddb.updateTimeToLive(params).promise();
  console.log(ttlRequest);
};

createDBTable();
