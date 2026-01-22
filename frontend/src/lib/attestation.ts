import axios from "axios";
import { PublicKey } from "@solana/web3.js";

const BACKEND_URL = "http://localhost:3001";

export interface AttestationData {
    wallet: string;
    score: number; // 0-100
    tier: number; // 1: Bronze, 2: Silver, 3: Gold
    timestamp: number;
    signature: number[];
    signatureBase58: string;
}

export const fetchAttestation = async (wallet: PublicKey): Promise<AttestationData> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/getAttestedScore`, {
            params: { wallet: wallet.toBase58() },
        });

        if (response.data.success && response.data.attestation) {
            return response.data.attestation;
        }

        throw new Error("Invalid response from attestation service");
    } catch (error: any) {
        console.error("Failed to fetch attestation:", error);
        throw new Error(error.response?.data?.error || "Failed to fetch FairScore");
    }
};

export const getTierName = (tier: number) => {
    switch (tier) {
        case 3: return "Gold";
        case 2: return "Silver";
        default: return "Bronze";
    }
};
