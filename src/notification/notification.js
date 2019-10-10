#!/usr/bin/env node

const amqp = require("amqplib/callback_api");

// Send notification with RabbitMQ if new deposit was found
// it sends message to bot service
// Producer


module.exports.notification = (userId, amount) => {
  amqp.connect("amqp://localhost", function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }

      const queue = "depositNotification";
      // var msg = "Hello World!";
      const msg = [{
        userId: userId,
        amount: amount
      }];

      channel.assertQueue(queue, {
        durable: false
      });
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

      console.log(" [x] Deposit Notification Sent %s", msg[0]);
    });
    setTimeout(function() {
      connection.close();
    }, 1000);
  });
};
