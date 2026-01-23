const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");

const pubkeyStr = "2xGDcaYgTLjzVdXZobAi3mFKgqEr4jXvWu7pibWeUXjF";
const pubkey = new PublicKey(pubkeyStr);
const bytes = pubkey.toBuffer();

console.log("Expected Bytes:", Array.from(bytes));

const rustBytes = [
    29, 3, 214, 127, 23, 229, 158, 36, 184, 74, 232, 62, 36, 76, 128, 188, 218, 219, 122, 236, 46,
    12, 74, 109, 175, 102, 171, 92, 71, 115, 194, 114
];

console.log("Rust Bytes:    ", rustBytes);

const match = rustBytes.every((val, index) => val === bytes[index]);
console.log("MATCH:", match);
