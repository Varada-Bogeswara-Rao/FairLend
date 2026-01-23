const { Keypair } = require("@solana/web3.js");
const bs58 = require("bs58");
require("dotenv").config();

try {
    const secretKeyString = process.env.ATTESTER_PRIVATE_KEY;
    if (!secretKeyString) {
        throw new Error("Missing Key");
    }
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    const pair = Keypair.fromSecretKey(secretKey);
    console.log("PUBKEY:" + pair.publicKey.toBase58());
} catch (e) {
    console.error(e);
}
