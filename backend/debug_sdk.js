
try {
    console.log("Attempting to load @solendprotocol/solend-sdk...");
    const sdk = require("@solendprotocol/solend-sdk");
    console.log("SUCCESS: Solend SDK loaded.");
    console.log("SDK keys:", Object.keys(sdk));
} catch (err) {
    console.error("FAIL: Could not load @solendprotocol/solend-sdk");
    console.error(err);
}

try {
    console.log("\nAttempting to load ./solendService...");
    const service = require("./solendService");
    console.log("SUCCESS: solendService loaded.");
} catch (err) {
    console.error("FAIL: Could not load ./solendService");
    console.error(err);
}
