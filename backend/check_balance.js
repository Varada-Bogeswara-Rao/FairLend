const { Connection, PublicKey } = require("@solana/web3.js");

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const wallet = new PublicKey("6rWsHZHnbA71H9thkbi8j1rcP2DiaQ7Hyxg4gKe8tJwi");
    // cSOL Mint Address on Devnet (from earlier logs)
    const cSolMint = new PublicKey("FzwZWRMc3GCqjSrcpVX3ueJc6UpcV6iWWb7ZMsTXE3Gf");

    console.log("Checking balance for wallet:", wallet.toBase58());
    console.log("Target Token (cSOL):", cSolMint.toBase58());

    try {
        const accounts = await connection.getParsedTokenAccountsByOwner(wallet, { mint: cSolMint });

        if (accounts.value.length > 0) {
            const data = accounts.value[0].account.data.parsed.info;
            console.log("\n✅ SUCCESS: Found cSOL account!");
            console.log("Balance:", data.tokenAmount.uiAmountString, "cSOL");
        } else {
            console.log("\n❌ NO cSOL FOUND. The deposit transaction likely failed or wasn't processed.");
        }
    } catch (err) {
        console.error("Error fetching accounts:", err);
    }
}

main();
