const { getDepositsTable } = require("./db/getAddrData");
const { getSession, saveSession } = require("./db/dynamoDB");
const { notification } = require("./notification/notification");

/** Searching for new deposits
 * @param {Object} trx - transaction object
 */
module.exports.transactionHandler = async trx => {
  let res = "";
  let toAddress;
  let amount;
  if (trx.type === "mempool") {
    if (trx.data[0].token.transactionType === "SEND") {
      const fromAddress = trx.data[0].input;
      const txid = trx.data[0].txid;
      trx.data[0].token.outputs.forEach(el => {
        if (el.address !== fromAddress) {
          toAddress = el.address;
          amount = parseInt(el.amount);
        }
      });
      console.log("Checking if toAddress includes in db: ", toAddress);
      let toAddressIncludes;

      try {
        toAddressIncludes = await getDepositsTable(toAddress);
      } catch (err) {
        console.log("address doesn includes: ", err);
      }

      if (!toAddressIncludes) return;

      if (toAddressIncludes.Item && amount > 0) {
        res += `***************************`;
        res += `\nNew deposit transaction At: ${new Date()}\nFrom: ${fromAddress}`;
        res += `\nTo: ${toAddress}\nAmount: ${amount}`;
        res += `\nTransaction ID: ${txid}`;
        res += `\n***************************`;

        console.log(res);

        if (toAddressIncludes.Item.userId === process.env.BOT_ID) {
          await updateEscrowSession(toAddressIncludes.Item.userId, amount);
        } else {
          await updateSession(toAddressIncludes.Item.userId, txid, amount);
          // Send notification to Telegram
          notification(toAddressIncludes.Item.userId, amount);
        }
      }
    }
  }
};

const updateSession = async (userId, trx, amount) => {
  const session = await getSession(userId);

  let deposits = session.wallet.transferedDeposits;

  deposits.transactions.push(trx);
  deposits.totalReceived += amount;
  deposits.txAppearances = deposits.transactions.length;

  // Update Session
  session.wallet.honkPoints += amount;
  session.wallet.transferedDeposits = deposits;

  saveSession(userId, session);
};

const updateEscrowSession = async (userId, amount) => {
  const session = await getSession(userId);

  // Update Session
  session.wallet.honkPoints += amount;
  session.totalTokensReceived += amount;

  saveSession(userId, session);
};
