const { Keypair, PublicKey } = require("@solana/web3.js");
const nacl = require("tweetnacl");
const bs58 = require("bs58").default || require("bs58");
require("dotenv").config();

// Load Keypair from env
let attesterKeypair;

try {
    const secretKeyString = process.env.ATTESTER_PRIVATE_KEY;
    if (!secretKeyString) {
        throw new Error("ATTESTER_PRIVATE_KEY not found in .env");
    }
    const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
    attesterKeypair = Keypair.fromSecretKey(secretKey);
    console.log("Loaded Attester Public Key:", attesterKeypair.publicKey.toBase58());
} catch (error) {
    console.error("Failed to load attester key:", error);
    process.exit(1);
}

function signAttestation(walletAddress, score, tier) {
    try {
        const walletPubkey = new PublicKey(walletAddress);
        const timestamp = Math.floor(Date.now() / 1000);

        // Message format must match onchain logic EXACTLY:
        // [wallet (32) | score (8) | tier (1) | timestamp (8)]
        // LE = Little Endian

        const buffer = Buffer.alloc(32 + 8 + 1 + 8);

        let offset = 0;

        // 1. Wallet (32 bytes)
        buffer.set(walletPubkey.toBuffer(), offset);
        offset += 32;

        // 2. Score (8 bytes, u64 LE)
        // Javascript numbers are doubles. Use BigInt for u64 safety.
        buffer.writeBigUInt64LE(BigInt(score), offset);
        offset += 8;

        // 3. Tier (1 byte, u8)
        buffer.writeUInt8(tier, offset);
        offset += 1;

        // 4. Timestamp (8 bytes, i64 LE)
        buffer.writeBigInt64LE(BigInt(timestamp), offset);
        offset += 8;

        const signature = nacl.sign.detached(buffer, attesterKeypair.secretKey);

        return {
            wallet: walletAddress,
            score,
            tier,
            timestamp,
            signature: Array.from(signature), // Return as array for frontend convenience
            signatureBase58: bs58.encode(signature) // or base58 string
        };

    } catch (error) {
        console.error("Signing error:", error);
        throw new Error("Failed to sign attestation");
    }
}

module.exports = { signAttestation };
