/* eslint-disable max-len */
const aws = require('aws-sdk');
const { invokeLambdaScheduledActions } = require('../helpers/invokeLambda');
// connect to dynamodb

const ddb = new aws.DynamoDB({
  apiVersion: '2012-08-10',
  region: process.env.DDB_LOCAL_REGION,
  endpoint: `http://localhost:${process.env.DDB_PORT}`,
});

const scanTableParams = {
  TableName: 'ScheduledActions',
};

const deleteItem = async (deleteItemParams) => {
  try {
    const response = await ddb.deleteItem(deleteItemParams).promise();
    console.log(`Successfully deleted: pk is ${deleteItemParams.Key.PK.S}, and sk is pk is ${deleteItemParams.Key.SK.S}`);
    return response;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    return err;
  }
};

const parseItem = async (element) => {
  const todayDate = new Date();
  const epochToday = Math.floor(todayDate.getTime() / 1000);
  // if the property TTL is smaller than current epoch time, delete the element
  if (parseInt(element.TTL.N, 10) < epochToday) {
    const ttlDate = new Date(element.TTL.N * 1000);
    const deleteItemParams = {
      Key: {
        PK: element.PK,
        SK: element.SK,
      },
      TableName: 'ScheduledActions',
    };
    return {
      deleteItemParams,
      ttlDate,
    };
  }
  return {};
};

const deleteExpiredItems = async () => {
  try {
    const data = await ddb.scan(scanTableParams).promise();
    await Promise.all(data.Items.map(async (element) => {
      const { deleteItemParams, ttlDate } = await parseItem(element);
      await deleteItem(deleteItemParams);

      // Similar to stream, call lambda to run the action after deleting the item
      const record = {};
      record.eventName = 'REMOVE';
      record.dynamodb = {};
      record.dynamodb.OldImage = element;
      await invokeLambdaScheduledActions('scheduledActions', record);
      console.log(`deleted action time is ${ttlDate.toLocaleString()}`);
    }));
    return data;
  } catch (err) {
    console.log(`Error: ${err.message}`);
    return err;
  }
};

deleteExpiredItems();

const timeoutSeconds = 5; // 5 seconds
const timeoutInterval = timeoutSeconds * 1000;
setInterval(() => deleteExpiredItems(), timeoutInterval);
