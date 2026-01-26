const { Connection, PublicKey } = require("@solana/web3.js");

async function main() {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    // Account from the user's transaction log that received +0.95 cSOL
    const tokenAccountPubkey = new PublicKey("EAdUMYsfnxLJXuaRNe1jf2wsyC4rRwH8i6ACFXXuqaS9");

    console.log("Inspecting Token Account:", tokenAccountPubkey.toBase58());

    try {
        const info = await connection.getParsedAccountInfo(tokenAccountPubkey);

        if (info.value) {
            const data = info.value.data.parsed.info;
            console.log("Owner:", data.owner);
            console.log("Mint:", data.mint);
            console.log("Token Amount:", data.tokenAmount.uiAmountString);
            console.log("State:", data.state);
        } else {
            console.log("Account not found!");
        }
    } catch (err) {
        console.error("Error:", err);
    }
}

main();
