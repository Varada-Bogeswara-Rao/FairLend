const { Connection, PublicKey } = require("@solana/web3.js");

const PROGRAM_ID = new PublicKey("H8Xjw5efShAHNmKL1fJQs1VMNbSc996y1NavEEwLMSdR");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

async function main() {
    console.log("Fetching recent signatures for program...");
    try {
        const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, { limit: 5 });
        console.log(`Found ${signatures.length} recent transactions.`);

        for (const sigInfo of signatures) {
            console.log(`\nTx: ${sigInfo.signature}`);
            if (sigInfo.err) {
                console.log("Status: FAILED");
            } else {
                console.log("Status: SUCCESS");
            }

            // Get logs
            const tx = await connection.getTransaction(sigInfo.signature, { maxSupportedTransactionVersion: 0 });
            if (tx && tx.meta && tx.meta.logMessages) {
                console.log("Logs:");
                tx.meta.logMessages.forEach(log => {
                    if (log.includes("Program H8Xjw")) {
                        console.log("  " + log);
                    }
                    // Show our custom msg! logs
                    if (log.includes("Warning:") || log.includes("Error:") || log.includes("Signature Verified")) {
                        console.log("  >>> " + log);
                    }
                });
            }
        }
    } catch (e) {
        console.error("Error fetching logs:", e);
    }
}

main();
