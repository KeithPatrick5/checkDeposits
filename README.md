# Check Deposits service for [@Honktipbot](https://t.me/honktipbot)

## About

This is a service that listen for new deposit transactions in SLP network.
If new deposit was found it sends notification to user and update balance.
To send notification we will use RabbitMQ.
To listen SLP network use https://slpsocket.fountainhead.cash

## Installation and local launch

1. Clone this repo:

   ```bash
   git clone https://github.com/KeithPatrick5/checkDeposits
   ```

2. Create AWS DynamoDB tables:

- Bot-Session (primary key: _Session_ [string])
- Bot-checkDeposit (primary key: _address_ [string])

3. Create `.env` file with the environment variables listed in `.env.example`

4. Install `NodeJS 10x` && `npm 6x`

5. Run in the root folder

   ```bash
   npm install
   ```

6. Install [RabbitMQ](https://www.rabbitmq.com/download.html)

7. Setup your EventSource url in index.js 

8. Run

    ```bash
    npm start
    ```
