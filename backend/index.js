const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const { signAttestation } = require("./signer");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const FAIRSCALE_API_URL = process.env.FAIRSCALE_API_URL || "https://api.fairscale.xyz";
const FAIRSCALE_API_KEY = process.env.FAIRSCALE_API_KEY;

// Tier logic (Normalized 0-100)
// < 50: Bronze (1)
// 50 - 75: Silver (2)
// > 75: Gold (3)
function calculateTier(score) {
    if (score >= 75) return 3; // Gold
    if (score >= 50) return 2; // Silver
    return 1; // Bronze
}

app.get("/getAttestedScore", async (req, res) => {
    const { wallet } = req.query;

    if (!wallet) {
        return res.status(400).json({ error: "Missing wallet address" });
    }

    try {
        console.log(`Fetching FairScore for ${wallet}...`);

        const response = await axios.get(`${FAIRSCALE_API_URL}/fairScore`, {
            params: { wallet },
            headers: {
                'x-api-key': FAIRSCALE_API_KEY,
                'fairkey': FAIRSCALE_API_KEY
            }
        });

        const fairScoreData = response.data;
        const rawScore = fairScoreData.fair_score || 0;

        // Normalize 0-1000 -> 0-100
        const score = Math.min(100, Math.floor(rawScore / 10));
        const tier = calculateTier(score);

        console.log(`Raw: ${rawScore}, Normalized: ${score}, Tier: ${tier}`);

        // Sign the data
        const attestation = signAttestation(wallet, score, tier);

        res.json({
            success: true,
            attestation
        });

    } catch (error) {
        console.error("Error processing request:", error.message);
        if (error.response) {
            console.error("FairScale API Error:", error.response.status, error.response.data);
        }

        // Fallback for Demo/Hackathon if API fails or rate limits
        // If we want to force specific tiers for testing:
        // Mock based on wallet char?
        // For now, return 500
        res.status(500).json({ error: "Failed to fetch score" });
    }
});

app.listen(PORT, () => {
    console.log(`Attestation Service running on port ${PORT}`);
});
