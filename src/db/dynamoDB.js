const DynamoDBSession = require("telegraf-session-dynamodb");
require("dotenv").config();

const dynamoSession = new DynamoDBSession({
  dynamoDBConfig: {
    params: {
      TableName: process.env.AWS_DYNAMODB_TABLE
    },
    getSessionKey: ctx => ctx.from && `${ctx.from.id}`,
    region: process.env.AWS_REGION
  }
});

module.exports.getSession = async key => {
  // Retrieve session state by session key (ctx.from.id)
  let session;
  try {
    session = await dynamoSession.getSession(key.toString());
    console.log("\ndynamoDB:: getSession\n");
    console.log(session.from.id);

    function isEmpty(obj) {
      return Object.keys(obj).length === 0;
    }
    if (isEmpty(session)) return false;
  } catch (err) {
    console.log(err);
  }

  return session;
};

module.exports.saveSession = (key, session) => {
  // Save session state
  dynamoSession.saveSession(key.toString(), session);
};