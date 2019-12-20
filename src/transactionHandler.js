const { getDepositsTable } = require("./db/getAddrData");
const { getSession, saveSession } = require("./db/dynamoDB");
const { notification } = require("./notification/notification");
const tokenType = process.env.TOKENTYPE;
const tokenDecimalPlaces = process.env.DECIMALPLACES;

/** Searching for new deposits
 * @param {Object} trx - transaction object
 */
module.exports.transactionHandler = async trx => {
  if (trx.type === "mempool") {
    const txData = trx.data[0];
    if (txData.token.transactionType === "SEND") {
      const outputs = txData.token.outputs; // recipients array
      const inputAddress = txData.input; // "from" address
      const txid = txData.txid;

      //Checking outputs addresses
      for (const output of outputs) {
        if (output.address !== inputAddress) {
          const toAddress = output.address;
          const amount =
            tokenType === "integer"
              ? parseInt(output.amount)
              : parseFloat(output.amount);
          await checkOutput(toAddress, amount, txid, inputAddress);
        }
      }
    }
  }
};

const checkOutput = async (toAddress, amount, txid, inputAddress) => {
  console.log("Checking if toAddress includes in db: ", toAddress);
  let toAddressIncludes;

  try {
    toAddressIncludes = await getDepositsTable(toAddress);
  } catch (err) {
    console.log("toAddress doesn't includes: ", toAddress);
    return;
  }

  if (!toAddressIncludes) return;

  if (toAddressIncludes.Item && amount > 0) {
    let res = "";
    res += `***************************`;
    res += `\nNew deposit transaction At: ${new Date()}\nFrom: ${inputAddress}`;
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
};

const updateSession = async (userId, trx, amount) => {
  const session = await getSession(userId);

  let deposits = session.wallet.transferedDeposits;

  deposits.transactions.push(trx);
  deposits.totalReceived = sum(deposits.totalReceived, amount);
  deposits.txAppearances = deposits.transactions.length;

  // Update Session
  session.wallet.honkPoints = sum(session.wallet.honkPoints, amount);
  session.wallet.transferedDeposits = deposits;

  saveSession(userId, session);
};

const updateEscrowSession = async (userId, amount) => {
  const session = await getSession(userId);

  // Update Session
  session.wallet.honkPoints = sum(session.wallet.honkPoints, amount);
  session.totalTokensReceived = sum(session.totalTokensReceived, amount);

  saveSession(userId, session);
};

const sum = (val1, val2) => {
  const confVal = Math.pow(10, tokenDecimalPlaces);
  return (confVal * val1 + confVal * val2) / confVal;
};