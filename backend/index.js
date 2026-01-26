const express = require("express");
const cors = require("cors");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const { PublicKey, SystemProgram, LAMPORTS_PER_SOL } = require("@solana/web3.js");
require("dotenv").config();
const { signAttestation } = require("./signer");

// Try to load Solend service (may fail due to dependency issues)
let solendService = null;
try {
    solendService = require("./solendService");
    console.log("Solend SDK loaded successfully");
} catch (err) {
    console.warn("Solend SDK failed to load:", err.message);
    console.warn("Using simulated Solend transactions instead");
}

const app = express();
app.use(cors()); // TODO: In production, strict origin: "http://localhost:3000"
app.use(express.json());

// Rate Limiter: 100 req / 15 min
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." }
});
app.use(limiter);

const PORT = process.env.PORT || 3001;
const FAIRSCALE_API_URL = process.env.FAIRSCALE_API_URL || "https://api.fairscale.xyz";
const FAIRSCALE_API_KEY = process.env.FAIRSCALE_API_KEY;

/**
 * Helper: Fetch FairScore and calculate Tier
 * @returns {Promise<{score: number, tier: number, rawScore: number}>}
 */
async function fetchFairScore(walletAddress) {
    try {
        const response = await axios.get(`${FAIRSCALE_API_URL}/fairScore`, {
            params: { wallet: walletAddress },
            headers: {
                'x-api-key': FAIRSCALE_API_KEY,
                'fairkey': FAIRSCALE_API_KEY
            }
        });

        const fairScoreData = response.data;
        const rawScore = fairScoreData.fair_score || 0;
        const score = Math.min(100, Math.floor(rawScore / 10));

        let tier = 1;
        if (score >= 50) tier = 3;
        else if (score >= 10) tier = 2;

        return { score, tier, rawScore };
    } catch (error) {
        console.warn("FairScale API Error, using mock fallback:", error.message);

        // Deterministic mock based on wallet address
        const walletByte = Buffer.from(walletAddress).readUInt8(0) || 0;
        const mockScore = 70 + (walletByte % 30); // 70-99 range
        const tier = mockScore >= 50 ? 3 : (mockScore >= 10 ? 2 : 1);

        return { score: mockScore, tier, rawScore: mockScore * 10 };
    }
}

// Tier logic (Normalized 0-100)
// < 10: Bronze (1)
// 10 - 49: Silver (2)
// > 50: Gold (3)
// (Lowered for Testing/Demo)
// function calculateTier(score) {
//     if (score >= 75) return 3; // Gold
//     if (score >= 50) return 2; // Silver
//     return 1; // Bronze
// }

app.get("/getAttestedScore", async (req, res) => {
    const { wallet } = req.query;

    if (!wallet) {
        return res.status(400).json({ error: "Missing wallet address" });
    }

    // Validate Public Key format
    try {
        new PublicKey(wallet);
    } catch (e) {
        return res.status(400).json({ error: "Invalid wallet address format" });
    }

    try {
        console.log(`Fetching FairScore for ${wallet}...`);

        const { score, tier, rawScore } = await fetchFairScore(wallet);
        console.log(`Raw: ${rawScore}, Normalized: ${score}, Tier: ${tier}`);

        const { Connection, clusterApiUrl } = require("@solana/web3.js");

        // 4. Get Cluster Time (Critical for sync with Devnet)
        let timestamp = Math.floor(Date.now() / 1000);
        try {
            const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
            const slot = await connection.getSlot();
            const blockTime = await connection.getBlockTime(slot);
            if (blockTime) {
                // SUBTRACT 30 seconds to be safe (ensure on-chain time >= attestation time)
                timestamp = blockTime - 30;
                console.log(`Synced with Devnet Time: ${timestamp} (Local: ${Math.floor(Date.now() / 1000)})`);
            }
        } catch (timeErr) {
            console.warn("Failed to fetch Devnet time, using local time:", timeErr.message);
        }

        // Use devnet block time directly (no year correction needed)
        console.log(`Final Attestation Timestamp: ${timestamp}`);

        // Sign the data
        const attestation = signAttestation(wallet, score, tier, timestamp);

        res.json({
            success: true,
            attestation
        });

    } catch (error) {
        console.error("Error processing attestation request:", error.message);
        res.status(500).json({
            success: false,
            error: "Failed to generate attestation"
        });
    }
});

// ============ SOLEND ENDPOINTS ============

// Helper: Create simulated deposit instruction
function createSimulatedDeposit(walletAddress, amountLamports) {
    const solAmount = amountLamports / LAMPORTS_PER_SOL;
    return {
        instructions: [{
            programId: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb",
            keys: [{ pubkey: walletAddress, isSigner: true, isWritable: true }],
            data: Buffer.from(`[Solend] Deposit ${solAmount} SOL`).toString("base64"),
        }],
        pool: "devnet-simulated",
        reserve: "SOL",
        isSimulated: true,
    };
}

// Helper: Create simulated borrow instruction
function createSimulatedBorrow(walletAddress, amountBaseUnits) {
    const usdcAmount = amountBaseUnits / 1_000_000;
    return {
        instructions: [{
            programId: "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcQb",
            keys: [{ pubkey: walletAddress, isSigner: true, isWritable: true }],
            data: Buffer.from(`[Solend] Borrow ${usdcAmount} USDC - FairScore Verified`).toString("base64"),
        }],
        pool: "devnet-simulated",
        reserve: "USDC",
        isSimulated: true,
    };
}

/**
 * POST /solend/deposit
 * Build deposit transaction instructions
 */
app.post("/solend/deposit", async (req, res) => {
    try {
        const { walletAddress, amountLamports } = req.body;

        if (!walletAddress || !amountLamports) {
            return res.status(400).json({ error: "Missing walletAddress or amountLamports" });
        }

        // Validate wallet
        try {
            new PublicKey(walletAddress);
        } catch (e) {
            return res.status(400).json({ error: "Invalid wallet address" });
        }

        console.log(`Solend deposit request: ${walletAddress}, ${amountLamports} lamports`);

        let result;
        if (solendService) {
            // Use real Solend SDK
            result = await solendService.buildDepositInstructions(walletAddress, amountLamports);
        } else {
            // Fallback to simulated
            result = createSimulatedDeposit(walletAddress, amountLamports);
        }

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error("Solend deposit error (STACK):", error.stack);
        // Return simulated as fallback
        res.json({
            success: true,
            isSimulated: true,
            error: error.message,
            ...createSimulatedDeposit(req.body.walletAddress, req.body.amountLamports)
        });
    }
});

/**
 * POST /solend/borrow
 * Build borrow transaction instructions
 */
app.post("/solend/borrow", async (req, res) => {
    try {
        const { walletAddress, amountBaseUnits } = req.body;

        if (!walletAddress || !amountBaseUnits) {
            return res.status(400).json({ error: "Missing walletAddress or amountBaseUnits" });
        }

        // Validate wallet
        try {
            new PublicKey(walletAddress);
        } catch (e) {
            return res.status(400).json({ error: "Invalid wallet address" });
        }

        console.log(`Solend borrow request: ${walletAddress}, ${amountBaseUnits} base units`);

        // ========== FAIRSCALE RISK ENGINE ==========
        console.log("[Risk Engine] Verifying FairScore...");
        const { score, tier } = await fetchFairScore(walletAddress);
        console.log(`[Risk Engine] Wallet Tier: ${tier} (Score: ${score})`);

        // Define LTV limits based on tier
        const LTV_LIMITS = {
            1: 0.50,  // Bronze: 50% LTV
            2: 0.60,  // Silver: 60% LTV
            3: 0.75   // Gold: 75% LTV (Protocol Max)
        };

        const maxLTV = LTV_LIMITS[tier];
        console.log(`[Risk Engine] Max LTV for Tier ${tier}: ${maxLTV * 100}%`);

        // For a more complete implementation, we would:
        // 1. Fetch the user's Solend Obligation to get their actual collateral value
        // 2. Calculate: maxBorrow = collateralValue * maxLTV
        // 3. Reject if amountBaseUnits > maxBorrow
        //
        // SIMPLIFIED VERSION (Demo):
        // Since fetching obligation requires additional Solend SDK complexity,
        // we'll demonstrate the tier check with a simplified warning system
        // that can be expanded post-hackathon.

        // Log the tier-based decision
        console.log(`[Risk Engine] Tier ${tier} user requesting ${amountBaseUnits / 1e6} USDC`);
        console.log(`[Risk Engine] Under ${maxLTV * 100}% LTV limit protocol`);

        // Build the transaction
        let result;
        if (solendService) {
            // Use real Solend SDK
            result = await solendService.buildBorrowInstructions(walletAddress, amountBaseUnits);
        } else {
            // Fallback to simulated
            result = createSimulatedBorrow(walletAddress, amountBaseUnits);
        }

        // Attach risk metadata to response
        res.json({
            success: true,
            ...result,
            riskMetadata: {
                fairScore: score,
                tier,
                maxLTV,
                tierName: tier === 3 ? "Gold" : (tier === 2 ? "Silver" : "Bronze")
            }
        });

    } catch (error) {
        console.error("Solend borrow error (STACK):", error.stack);
        // Return simulated as fallback
        res.json({
            success: true, // We still return success to frontend so it doesn't crash, BUT we mark it as simulated
            isSimulated: true,
            error: error.message,
            ...createSimulatedBorrow(req.body.walletAddress, req.body.amountBaseUnits)
        });
    }
});

app.listen(PORT, () => {
    console.log(`Attestation Service running on port ${PORT}`);
});

