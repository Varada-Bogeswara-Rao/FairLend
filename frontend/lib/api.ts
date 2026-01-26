import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? 'https://fairlend.onrender.com' : 'http://localhost:3001');

export interface SolendInstruction {
    programId: string;
    keys: {
        pubkey: string;
        isSigner: boolean;
        isWritable: boolean;
    }[];
    data: string; // base64
}

export interface ApiResponse {
    success: boolean;
    instructions?: SolendInstruction[];
    isSimulated?: boolean;
    error?: string;
    riskMetadata?: {
        fairScore: number;
        tier: number;
        maxLTV: number;
        tierName: string;
    };
}

export const api = {
    depositRequest: async (walletAddress: string, amountLamports: number): Promise<ApiResponse> => {
        try {
            const response = await axios.post(`${API_URL}/solend/deposit`, {
                walletAddress,
                amountLamports
            });
            return response.data;
        } catch (error: any) {
            console.error('API Deposit Error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    },

    borrowRequest: async (walletAddress: string, amountBaseUnits: number): Promise<ApiResponse> => {
        try {
            const response = await axios.post(`${API_URL}/solend/borrow`, {
                walletAddress,
                amountBaseUnits
            });
            return response.data;
        } catch (error: any) {
            console.error('API Borrow Error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Unknown error'
            };
        }
    }
};
