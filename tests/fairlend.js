const anchor = require("@coral-xyz/anchor");
const { assert } = require("chai");
const nacl = require("tweetnacl");
const fs = require("fs");
const { Ed25519Program, Keypair, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY } = require("@solana/web3.js");

describe("fairlend", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.fairlend;

  // Load the Attester Keypair
  const attesterSecret = new Uint8Array(
    JSON.parse(fs.readFileSync("attester.json", "utf-8"))
  );
  const attesterKeypair = Keypair.fromSecretKey(attesterSecret);

  it("Borrows successfull with Gold Tier", async () => {
    const user = provider.wallet;

    const score = new anchor.BN(800); // FairScore
    const tier = 3; // Gold
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));

    // Construct Message
    // [wallet (32) | score (8) | tier (1) | timestamp (8)]
    // Use LE for numbers as per Rust to_le_bytes
    const msg = new Uint8Array(32 + 8 + 1 + 8);
    msg.set(user.publicKey.toBytes(), 0);
    msg.set(score.toArrayLike(Buffer, "le", 8), 32);
    msg.set([tier], 40);
    msg.set(timestamp.toArrayLike(Buffer, "le", 8), 41);

    // Create Ed25519 Instruction
    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: attesterKeypair.publicKey.toBytes(),
      message: msg,
      signature: nacl.sign.detached(msg, attesterSecret),
    });

    let eventDetected = false;
    const listener = program.addEventListener("BorrowApproved", (event) => {
      assert.ok(event.user.equals(user.publicKey));
      assert.equal(event.tier, tier);
      assert.equal(event.maxLtv, 85);
      eventDetected = true;
    });

    await program.methods
      .validateBorrow(score, tier, timestamp)
      .accounts({
        user: user.publicKey,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .preInstructions([ed25519Ix])
      .rpc();

    await new Promise(r => setTimeout(r, 1000));
    assert.ok(eventDetected, "BorrowApproved event not detected");
    program.removeEventListener(listener);
  });

  it("Fails with Bronze Tier", async () => {
    const user = provider.wallet;

    const score = new anchor.BN(40);
    const tier = 1; // Bronze
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));

    const msg = new Uint8Array(32 + 8 + 1 + 8);
    msg.set(user.publicKey.toBytes(), 0);
    msg.set(score.toArrayLike(Buffer, "le", 8), 32);
    msg.set([tier], 40);
    msg.set(timestamp.toArrayLike(Buffer, "le", 8), 41);

    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: attesterKeypair.publicKey.toBytes(),
      message: msg,
      signature: nacl.sign.detached(msg, attesterSecret),
    });

    try {
      await program.methods
        .validateBorrow(score, tier, timestamp)
        .accounts({ user: user.publicKey, instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY })
        .preInstructions([ed25519Ix])
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.include(e.message, "FairScore Tier too low");
    }
  });

  it("Fails if Ed25519 instruction signs wrong message", async () => {
    const user = provider.wallet;
    const score = new anchor.BN(800);
    const tier = 3;
    const timestamp = new anchor.BN(Math.floor(Date.now() / 1000));

    // Sign a DIFFERENT message (e.g. valid format but different score)
    const badScore = new anchor.BN(100);
    const badMsg = new Uint8Array(32 + 8 + 1 + 8);
    badMsg.set(user.publicKey.toBytes(), 0);
    badMsg.set(badScore.toArrayLike(Buffer, "le", 8), 32);
    badMsg.set([tier], 40);
    badMsg.set(timestamp.toArrayLike(Buffer, "le", 8), 41);

    const ed25519Ix = Ed25519Program.createInstructionWithPublicKey({
      publicKey: attesterKeypair.publicKey.toBytes(),
      message: badMsg,
      signature: nacl.sign.detached(badMsg, attesterSecret),
    });

    try {
      await program.methods
        .validateBorrow(score, tier, timestamp)
        .accounts({ user: user.publicKey, instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY })
        .preInstructions([ed25519Ix])
        .rpc();
      assert.fail("Should have failed");
    } catch (e) {
      assert.include(e.message, "Signature Verification Failed");
    }
  });
});
