import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Fairlend } from "../target/types/fairlend";
import { assert } from "chai";

describe("fairlend", () => {
    // Configure the client to use the local cluster.
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program: any = anchor.workspace.Fairlend;

    it("Is initialized and validates borrow!", async () => {
        const timestamp = Math.floor(Date.now() / 1000);
        const score = 750;
        const tier = 3; // Gold

        try {
            const tx = await program.methods
                .validateBorrow(score, tier, new anchor.BN(timestamp))
                .accounts({
                    user: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();

            console.log("Your transaction signature", tx);
        } catch (e) {
            console.error(e);
            throw e;
        }
    });

    it("Fails on stale timestamp", async () => {
        const staleTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s ago
        const score = 750;
        const tier = 3;

        try {
            await program.methods
                .validateBorrow(score, tier, new anchor.BN(staleTimestamp))
                .accounts({
                    user: provider.wallet.publicKey,
                    systemProgram: anchor.web3.SystemProgram.programId,
                })
                .rpc();
            assert.fail("Should have failed due to stale timestamp");
        } catch (e) {
            assert.ok(e.toString().includes("StaleAttestation"));
        }
    });
});
