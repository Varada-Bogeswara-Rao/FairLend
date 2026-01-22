import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Ed25519Program } from "@solana/web3.js";
import { BN, Program, AnchorProvider } from "@coral-xyz/anchor";
import { PROGRAM_ID } from "@/lib/solana";
import { AttestationData } from "@/lib/attestation";
import * as anchor from "@coral-xyz/anchor";

// IDL Interface (simplified for prototype)
// Ideally import this from target/types/fairlend.ts
const IDL = {
    "version": "0.1.0",
    "name": "fairlend",
    "instructions": [
        {
            "name": "validateBorrow",
            "accounts": [
                { "name": "user", "isMut": true, "isSigner": true },
                { "name": "systemProgram", "isMut": false, "isSigner": false },
                { "name": "sysvarInstructions", "isMut": false, "isSigner": false }
            ],
            "args": [
                { "name": "score", "type": "u64" },
                { "name": "tier", "type": "u8" },
                { "name": "timestamp", "type": "i64" }
            ]
        }
    ]
};

interface BorrowFormProps {
    attestation: AttestationData | null;
    refreshAttestation: () => void;
}

export const BorrowForm: FC<BorrowFormProps> = ({ attestation, refreshAttestation }) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [borrowAmount, setBorrowAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");

    const handleBorrow = async () => {
        if (!wallet.publicKey || !attestation) return;
        setStatus("Preparing transaction...");
        setLoading(true);

        try {
            if (attestation.tier < 2) {
                throw new Error("Tier too low to borrow. Increase your FairScore to Bronze or higher.");
            }

            // 1. Create Ed25519 Instruction
            // Reconstruct message: [wallet(32) | score(8) | tier(1) | timestamp(8)]

            const walletBytes = wallet.publicKey.toBuffer();
            const scoreBytes = new BN(attestation.score).toArrayLike(Buffer, 'le', 8);
            const tierBytes = Buffer.alloc(1);
            tierBytes.writeUInt8(attestation.tier);
            const timestampBytes = new BN(attestation.timestamp).toArrayLike(Buffer, 'le', 8);

            const message = Buffer.concat([walletBytes, scoreBytes, tierBytes, timestampBytes]);

            // Attester Public Key (hardcoded in matching lib.rs)
            // 2xGDca...
            const attesterPubkey = new PublicKey("2xGDcaYgTLjzVdXZobAi3mFKgqEr4jXvWu7pibWeUXjF");

            const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
                publicKey: attesterPubkey.toBuffer(),
                message: message,
                signature: new Uint8Array(attestation.signature),
            });

            // 2. Create Anchor Instruction
            const provider = new AnchorProvider(connection, wallet as any, {});
            const program = new Program(IDL as any, PROGRAM_ID, provider);

            const validateIx = await program.methods
                .validateBorrow(
                    new BN(attestation.score),
                    attestation.tier,
                    new BN(attestation.timestamp)
                )
                .accounts({
                    user: wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                    sysvarInstructions: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                })
                .instruction();

            // 3. Build Transaction
            const tx = new Transaction();
            tx.add(ed25519Ix);
            tx.add(validateIx);

            // TODO: Add Kamino Borrow Instruction here
            // For prototype, we just validate eligibility + mock borrow success

            setStatus("Sending transaction...");
            const signature = await wallet.sendTransaction(tx, connection);

            setStatus("Confirming...");
            await connection.confirmTransaction(signature, "confirmed");

            setStatus(`Success! Borrow approved. Tx: ${signature.slice(0, 8)}...`);
            // Trigger Kamino SDK logic here (client side execution after check)

        } catch (error: any) {
            console.error(error);
            setStatus(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const maxLTV = attestation?.tier === 3 ? "85%" : attestation?.tier === 2 ? "70%" : "0%";

    return (
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Borrow USDC</h2>

            <div className="mb-4 text-sm text-gray-400">
                <div className="flex justify-between mb-1">
                    <span>Current Tier Max LTV:</span>
                    <span className="text-white font-mono">{maxLTV}</span>
                </div>
                <div className="flex justify-between">
                    <span>Asset:</span>
                    <span className="text-white">USDC</span>
                </div>
            </div>

            <input
                type="number"
                placeholder="Amount to borrow"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(e.target.value)}
                className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 mb-4"
                disabled={!attestation || attestation.tier < 2}
            />

            <button
                onClick={handleBorrow}
                disabled={loading || !attestation || attestation.tier < 2}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${!attestation || attestation.tier < 2 ? "bg-gray-600 cursor-not-allowed opacity-50" :
                        loading ? "bg-blue-800 cursor-wait" :
                            "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
            >
                {loading ? "Processing..." :
                    !attestation ? "Connect Wallet & Check Score" :
                        attestation.tier < 2 ? "Upgrade Tier to Borrow" :
                            "Borrow USDC"}
            </button>

            {status && (
                <div className={`mt-4 text-center text-sm p-3 rounded bg-black/30 ${status.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                    {status}
                </div>
            )}
        </div>
    );
};
