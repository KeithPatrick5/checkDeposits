require("dotenv").config();
const { transactionHandler } = require("./src/transactionHandler");
const EventSource = require("eventsource");

// Query example
// const query = {
//   "v": 3,
//   "q": {
//     "find": {
//       "slp.detail.tokenIdHex":
//         "7f8889682d57369ed0e32336f8b7e0ffec625a35cca183f4e81fde4e71a538a1"
//     }
//   },
//   "r": {
//     "f":
//       "[ .[] | { valid: .slp.valid, token: .slp.detail, input: .in[0].e.a, blocktime: .blk.t, txid: .tx.h }]"
//   }
// };

const bitsocket = new EventSource(
  "https://slpsocket.fountainhead.cash/s/ewogICJ2IjogMywKICAgICJxIjogewogICAgICAiZmluZCI6IHsKICAgICAgICAic2xwLmRldGFpbC50b2tlbklkSGV4IjoiN2Y4ODg5NjgyZDU3MzY5ZWQwZTMyMzM2ZjhiN2UwZmZlYzYyNWEzNWNjYTE4M2Y0ZTgxZmRlNGU3MWE1MzhhMSIKICAgICAgfQogICAgfSwKICAgICJyIjogewogICAgICAiZiI6ICJbIC5bXSB8IHsgdmFsaWQ6IC5zbHAudmFsaWQsIHRva2VuOiAuc2xwLmRldGFpbCwgaW5wdXQ6IC5pblswXS5lLmEsIGJsb2NrdGltZTogLmJsay50LCB0eGlkOiAudHguaCB9XSIKICAgIH0KfQ=="
);

bitsocket.onmessage = function(event) {
  console.log("Socket connected.");
  data = JSON.parse(event.data);
  transactionHandler(data);
};
