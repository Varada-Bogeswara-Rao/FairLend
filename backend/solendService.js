const { Connection, PublicKey, clusterApiUrl } = require("@solana/web3.js");
const { SolendActionCore } = require("@solendprotocol/solend-sdk");
const axios = require("axios");

// Solend Devnet Config URL
const SOLEND_DEVNET_CONFIG_URL = "https://api.solend.fi/v1/markets/configs?scope=all&deployment=devnet";

/**
 * Fetch Solend pool configuration
 */
async function fetchSolendConfig(environment = "devnet") {
    const configUrl = environment === "devnet"
        ? SOLEND_DEVNET_CONFIG_URL
        : "https://api.solend.fi/v1/markets/configs?scope=all";

    console.log("Fetching Solend config from:", configUrl);
    try {
        const response = await axios.get(configUrl);
        const configs = response.data;

        const mainPool = configs.find(pool => pool.name === "main" || pool.isPrimary);
        console.log("Solend config loaded:", mainPool?.name || "not found");

        return mainPool;
    } catch (err) {
        console.error("Failed to fetch Solend config:", err.message);
        throw err;
    }
}

/**
 * Helper: Format reserve to match SDK expectations
 * Maps nested 'liquidityToken.mint' to 'mintAddress' which the SDK expects correctly.
 */
function formatReserve(reserve) {
    return {
        ...reserve,
        mintAddress: reserve.liquidityToken.mint,
        cTokenMint: reserve.collateralMintAddress,
        cTokenLiquidityAddress: reserve.collateralSupplyAddress,
    };
}

/**
 * Build deposit transaction instructions
 */
async function buildDepositInstructions(walletAddress, amountLamports) {
    console.log(`Building Solend deposit for ${walletAddress}, amount: ${amountLamports}`);

    // Ensure connection is established
    const rpcUrl = process.env.RPC_URL || clusterApiUrl("devnet");
    const connection = new Connection(rpcUrl, "confirmed");

    // Fetch Solend config
    const pool = await fetchSolendConfig("devnet");
    if (!pool) throw new Error("Solend devnet pool not found");

    // Find SOL reserve
    const rawReserve = pool.reserves.find(r =>
        r.liquidityToken?.symbol === "SOL" || r.liquidityToken?.symbol === "WSOL"
    );
    if (!rawReserve) throw new Error("SOL reserve not found in Solend devnet");

    const solReserve = formatReserve(rawReserve);
    console.log("Found SOL reserve:", solReserve.liquidityToken?.symbol, "Mint:", solReserve.mintAddress);

    // Creates a compliant wallet adapter
    const walletPubkey = new PublicKey(walletAddress);
    const wallet = {
        publicKey: walletPubkey,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
    };

    console.log("Wallet adapter created with pubkey:", wallet.publicKey.toBase58());

    // Build deposit transaction using Solend SDK
    try {
        const depositAction = await SolendActionCore.buildDepositTxns(
            pool,
            solReserve,
            connection,
            amountLamports.toString(),
            wallet,
            { environment: "devnet" }
        );

        const instructions = await depositAction.getInstructions();

        const allInstructions = [
            ...instructions.oracleIxs,
            ...instructions.pythIxGroups.flat(),
            ...instructions.preLendingIxs,
            ...instructions.lendingIxs,
            ...instructions.postLendingIxs,
        ];

        console.log(`Built ${allInstructions.length} instructions for deposit (including ${instructions.oracleIxs.length + instructions.pythIxGroups.flat().length} oracle updates)`);

        return {
            instructions: allInstructions.map(serializeInstruction),
            pool: pool.name,
            reserve: solReserve.liquidityToken?.symbol,
        };
    } catch (err) {
        console.error("Solend SDK Deposit Error:", err);
        throw err;
    }
}

/**
 * Build borrow transaction instructions
 */
async function buildBorrowInstructions(walletAddress, amountBaseUnits) {
    console.log(`Building Solend borrow for ${walletAddress}, amount: ${amountBaseUnits}`);

    // Ensure connection is established
    const rpcUrl = process.env.RPC_URL || clusterApiUrl("devnet");
    const connection = new Connection(rpcUrl, "confirmed");

    // Fetch Solend config
    const pool = await fetchSolendConfig("devnet");
    if (!pool) throw new Error("Solend devnet pool not found");

    // Find USDC reserve
    const rawReserve = pool.reserves.find(r =>
        r.liquidityToken?.symbol === "USDC"
    );
    if (!rawReserve) throw new Error("USDC reserve not found in Solend devnet");

    const usdcReserve = formatReserve(rawReserve);
    console.log("Found USDC reserve:", usdcReserve.liquidityToken?.symbol, "Mint:", usdcReserve.mintAddress);

    // Creates a compliant wallet adapter
    const walletPubkey = new PublicKey(walletAddress);
    const wallet = {
        publicKey: walletPubkey,
        signTransaction: async (tx) => tx,
        signAllTransactions: async (txs) => txs,
    };

    console.log("Wallet adapter created with pubkey:", wallet.publicKey.toBase58());

    // Build borrow transaction using Solend SDK
    try {
        const borrowAction = await SolendActionCore.buildBorrowTxns(
            pool,
            usdcReserve,
            connection,
            amountBaseUnits.toString(),
            wallet,
            { environment: "devnet" }
        );

        const instructions = await borrowAction.getInstructions();

        const allInstructions = [
            ...instructions.oracleIxs,
            ...instructions.pythIxGroups.flat(),
            ...instructions.preLendingIxs,
            ...instructions.lendingIxs,
            ...instructions.postLendingIxs,
        ];

        console.log(`Built ${allInstructions.length} instructions for borrow (including ${instructions.oracleIxs.length + instructions.pythIxGroups.flat().length} oracle updates)`);

        return {
            instructions: allInstructions.map(serializeInstruction),
            pool: pool.name,
            reserve: usdcReserve.liquidityToken?.symbol,
        };
    } catch (err) {
        console.error("Solend SDK Borrow Error:", err);
        if (err.message && err.message.includes("_bn")) {
            console.error("CRITICAL: _bn error detected. This usually means a PublicKey mismatch inside the SDK.");
        }
        throw err;
    }
}

function serializeInstruction(ix) {
    return {
        programId: ix.instruction.programId.toBase58(),
        keys: ix.instruction.keys.map(k => ({
            pubkey: k.pubkey.toBase58(),
            isSigner: k.isSigner,
            isWritable: k.isWritable,
        })),
        data: Buffer.from(ix.instruction.data).toString("base64"),
    };
}

module.exports = {
    fetchSolendConfig,
    buildDepositInstructions,
    buildBorrowInstructions,
};
