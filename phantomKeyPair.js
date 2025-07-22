// phantomKeyPair.js
const nacl = require("tweetnacl");
const bs58 = require("bs58");

const keyPair = nacl.box.keyPair();

const publicKey = bs58.encode(keyPair.publicKey);
const secretKey = keyPair.secretKey;

module.exports = {
  publicKey,
  secretKey,
  keyPair,
};
