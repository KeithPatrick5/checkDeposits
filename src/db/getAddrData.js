require("dotenv").config();
const AWS = require("aws-sdk");

AWS.config.update({
  region: process.env.AWS_REGION
});

const docClient = new AWS.DynamoDB.DocumentClient();

/** Retrieve user by SLP address from DynamoDB
 *
 */
module.exports.getDepositsTable = async address => {
  let addressData;
  try {
    const params = {
      TableName: process.env.AWS_DYNAMODB_DEPOSITS_TABLE,
      Key: {
          address: address
      }
    };
    
    addressData = await docClient.get(params).promise();

    if (isEmpty(addressData)) return false;
  } catch (err) {
    console.log(err);
    throw err;
  }

  return addressData;
};

module.exports.saveToDepositsTable = async (address, userId) => {
  // Use SLP Address
  const params = {
    TableName: process.env.AWS_DYNAMODB_DEPOSITS_TABLE,
    Item: {
      address: address,
      userId: userId
    }
  };
  try {
    await docClient.put(params).promise();
  } catch (err) {
    console.log(err);
  }
};

function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}