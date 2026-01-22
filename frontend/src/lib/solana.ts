import { Connection, PublicKey } from "@solana/web3.js";

// Devnet Program ID from Anchor deployment
export const PROGRAM_ID = new PublicKey("H8Xjw5efShAHNmKL1fJQs1VMNbSc996y1NavEEwLMSdR");

// Devnet endpoint (use default or custom RPC if available)
export const SOLANA_RPC = "https://api.devnet.solana.com";

export const connection = new Connection(SOLANA_RPC, "confirmed");

export const getExplorerUrl = (txSignature: string) => {
    return `https://explorer.solana.com/tx/${txSignature}?cluster=devnet`;
};
