import { FC, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Ed25519Program } from "@solana/web3.js";
import { BN, Program, AnchorProvider } from "@coral-xyz/anchor";
import { PROGRAM_ID } from "@/lib/solana";
import { AttestationData } from "@/lib/attestation";
import * as anchor from "@coral-xyz/anchor";
import { getSimulatedBorrowInstruction } from "@/lib/kamino";

// IDL Interface (simplified for prototype)
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
            const walletBytes = wallet.publicKey.toBuffer();
            const scoreBytes = new BN(attestation.score).toArrayLike(Buffer, 'le', 8);

            const tierBytes = Buffer.alloc(1);
            tierBytes.writeUInt8(attestation.tier);

            const timestampBytes = new BN(attestation.timestamp).toArrayLike(Buffer, 'le', 8);

            const message = Buffer.concat([walletBytes, scoreBytes, tierBytes, timestampBytes]);
            const attesterPubkey = new PublicKey("2xGDcaYgTLjzVdXZobAi3mFKgqEr4jXvWu7pibWeUXjF");

            console.log("Constructing Tx...");
            console.log("Wallet:", wallet.publicKey.toBase58());
            console.log("Score:", attestation.score);
            console.log("Tier:", attestation.tier);
            console.log("Timestamp:", attestation.timestamp);
            console.log("Attester:", attesterPubkey.toBase58());

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

            // 3. Create Kamino Borrow Instruction (Target: Mocked for stability)
            const borrowAmountNum = parseFloat(borrowAmount) || 0;
            const kaminoIx = getSimulatedBorrowInstruction(wallet.publicKey, borrowAmountNum);

            // 4. Build Transaction (Atomic Bundle)
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            const tx = new Transaction({
                feePayer: wallet.publicKey,
                blockhash,
                lastValidBlockHeight,
            });

            tx.add(ed25519Ix);   // 1. Verify Signature
            tx.add(validateIx);  // 2. Check logic (Tier, Time) -> Reverts if fail
            tx.add(kaminoIx);    // 3. Execute Borrow (only if 1 & 2 pass)

            setStatus("Sending transaction...");

            // Attempt to send with skipPreflight: false (default) to catch simulation errors
            try {
                const signature = await wallet.sendTransaction(tx, connection);
                setStatus("Confirming...");
                await connection.confirmTransaction(signature, "confirmed");
                setStatus(`Success! Borrow approved & executed. Tx: ${signature.slice(0, 8)}...`);
            } catch (sendError: any) {
                console.error("SendTransaction Error:", sendError);
                // Try to extract logs
                if (sendError.logs) {
                    console.error("Simulation Logs:", sendError.logs);
                    setStatus(`Tx Failed: ${sendError.logs[sendError.logs.length - 1]}`); // Show last log
                } else {
                    throw sendError;
                }
            }

        } catch (error: any) {
            console.error("Detailed Error:", error);
            setStatus(`Error: ${error.message || "Transaction failed"}`);
        } finally {
            setLoading(false);
        }
    };

    const maxLTV = attestation?.tier === 3 ? "85%" : attestation?.tier === 2 ? "70%" : "0%";

    return (
        <div className="glass-panel p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>💸</span> Borrow USDC
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Max LTV</div>
                    <div className="text-xl font-mono font-bold text-blue-400">{maxLTV}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Asset</div>
                    <div className="text-xl font-bold flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500"></div> USDC
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs text-gray-400 uppercase tracking-wider mb-2 ml-1">Amount</label>
                <input
                    type="number"
                    placeholder="0.00"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    className="glass-input w-full p-4 rounded-xl text-lg font-mono outline-none"
                    disabled={!attestation || attestation.tier < 2}
                />
            </div>

            <button
                onClick={handleBorrow}
                disabled={loading || !attestation || attestation.tier < 2}
                className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide glass-button ${!attestation || attestation.tier < 2 ? "bg-gray-800/50 text-gray-500 cursor-not-allowed border border-white/5" :
                    loading ? "bg-blue-600/50 cursor-wait animate-pulse" :
                        "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/30"
                    }`}
            >
                {loading ? "Processing Transaction..." :
                    !attestation ? "Connect Wallet First" :
                        attestation.tier < 2 ? "Tier Too Low to Borrow" :
                            "Confirm Borrow"}
            </button>

            <div className="mt-4 flex justify-center">
                <button
                    onClick={async () => {
                        if (!wallet.publicKey) return;
                        setStatus("Testing simple tx...");
                        try {
                            const tx = new Transaction();
                            tx.add(getSimulatedBorrowInstruction(wallet.publicKey, 1));
                            const sig = await wallet.sendTransaction(tx, connection);
                            await connection.confirmTransaction(sig, "confirmed");
                            setStatus("Simple Tx Success! Wallet is working.");
                        } catch (e: any) {
                            console.error(e);
                            setStatus("Simple Tx Failed: " + e.message);
                        }
                    }}
                    className="text-xs text-gray-500 underline hover:text-white"
                >
                    Test Wallet Connection (Debug)
                </button>
            </div>

            {status && (
                <div className={`mt-6 text-center text-sm p-4 rounded-xl border backdrop-blur-md animate-fade-in ${status.startsWith("Success")
                    ? "bg-green-500/10 border-green-500/20 text-green-200"
                    : status.startsWith("Error")
                        ? "bg-red-500/10 border-red-500/20 text-red-200"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-200"
                    }`}>
                    {status}
                </div>
            )}
        </div>
    );
};
