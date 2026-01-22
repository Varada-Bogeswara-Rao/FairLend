use anchor_lang::prelude::*;
use anchor_lang::solana_program::sysvar::instructions as sysvar_instructions;
use anchor_lang::solana_program::ed25519_program;
use anchor_lang::solana_program::instruction::Instruction;

declare_id!("H8Xjw5efShAHNmKL1fJQs1VMNbSc996y1NavEEwLMSdR");

const ATTESTER_PUBKEY_BYTES: [u8; 32] = [
    29, 3, 214, 127, 23, 229, 158, 36, 184, 74, 232, 62, 36, 76, 128, 188, 218, 219, 122, 236, 46,
    12, 74, 109, 175, 102, 171, 92, 71, 115, 194, 114,
];

#[program]
pub mod fairlend {
    use super::*;

    pub fn validate_borrow(
        ctx: Context<ValidateBorrow>,
        score: u64,
        tier: u8,
        timestamp: i64,
        // Optional: pass index of ed25519 ix, but scanning is safer if simpler
    ) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        // 1. Verify freshness
        if current_time - timestamp > 300 {
            return err!(FairLendError::StaleAttestation);
        }
        if timestamp > current_time + 10 {
            return err!(FairLendError::InvalidTimestamp);
        }

        // 2. Reconstruct the message that SHOULD have been signed
        // Message format: [wallet (32) | score (8) | tier (1) | timestamp (8)]
        let user_key = ctx.accounts.user.key().to_bytes();
        let score_bytes = score.to_le_bytes();
        let tier_bytes = tier.to_le_bytes();
        let timestamp_bytes = timestamp.to_le_bytes();

        let mut expected_message = Vec::new();
        expected_message.extend_from_slice(&user_key);
        expected_message.extend_from_slice(&score_bytes);
        expected_message.extend_from_slice(&tier_bytes);
        expected_message.extend_from_slice(&timestamp_bytes);

        // 3. Verify that an Ed25519 instruction corresponding to this message exists
        let sysvar_info = &ctx.accounts.instructions_sysvar;
        
        // Load the current instruction index to look backwards? 
        // Or just scan all instructions. Since tx are small, scanning is fine.
        let mut found_signature = false;
        
        // We use solana_program::sysvar::instructions::load_instruction_at_checked
        // We iterate 0..current_index (or all).
        // For simplicity, we assume the ed25519 ix is usually the first one or before this one.
        for i in 0..sysvar_instructions::load_current_index_checked(sysvar_info)? {
            let ix = sysvar_instructions::load_instruction_at_checked(i as usize, sysvar_info).ok();
            if let Some(instruction) = ix {
                if instruction.program_id == ed25519_program::ID {
                    // This is an ed25519 instruction. Now verify its data content.
                    // The instruction data must contain the correct signer and message.
                    // Since the native program ALREADY verified the signature matches the data provided,
                    // we just need to verify the data provided matches what we expect.
                    
                    if verify_ed25519_ix_data(&instruction.data, &ATTESTER_PUBKEY_BYTES, &expected_message) {
                        found_signature = true;
                        break;
                    }
                }
            }
        }

        if !found_signature {
             return err!(FairLendError::InvalidSignature);
        }

        // 4. Enforce Tier Rules
        if tier < 2 {
            return err!(FairLendError::TierTooLow);
        }

        emit!(BorrowApproved {
            user: ctx.accounts.user.key(),
            score,
            tier,
            max_ltv: get_ltv_for_tier(tier),
            timestamp,
        });

        Ok(())
    }
}

fn get_ltv_for_tier(tier: u8) -> u8 {
    match tier {
        1 => 0,  
        2 => 70, 
        3 => 85, 
        _ => 0,
    }
}

// Logic to parse the standard Ed25519 instruction data layout and verify contents
// https://docs.solana.com/developing/runtime-facilities/programs#ed25519-program
fn verify_ed25519_ix_data(data: &[u8], expected_signer: &[u8; 32], expected_message: &[u8]) -> bool {
    // Layout:
    // num_signatures (u8)
    // padding (u8)
    // signature_offset (u16)
    // signature_instruction_index (u16)
    // public_key_offset (u16)
    // public_key_instruction_index (u16)
    // message_data_offset (u16)
    // message_data_size (u16)
    // message_instruction_index (u16)
    
    // We expect at least one header (16 bytes) + minimal data
    if data.len() < 16 + 64 + 32 { 
        return false;
    }

    let num_signatures = data[0];
    if num_signatures == 0 {
        return false;
    }

    // We assume the FIRST signature in the instruction is the one we care about.
    // Or we scan them all? We'll check the first one for simplicity for this hackathon.
    
    // Parse offsets (Little Endian)
    // offsets are relative to the start of the instruction data
    
    let public_key_offset = u16::from_le_bytes([data[6], data[7]]) as usize;
    let message_data_offset = u16::from_le_bytes([data[10], data[11]]) as usize;
    let message_data_size = u16::from_le_bytes([data[12], data[13]]) as usize;

    // Check bounds
    if public_key_offset + 32 > data.len() {
        return false;
    }
    
    if message_data_offset + message_data_size > data.len() {
        return false;
    }

    // 1. Check Public Key
    let pk_in_ix = &data[public_key_offset..public_key_offset+32];
    if pk_in_ix != expected_signer {
        return false;
    }

    // 2. Check Message
    if message_data_size != expected_message.len() {
        return false; // Valid signature but for a DIFFERENT message
    }

    let msg_in_ix = &data[message_data_offset..message_data_offset+message_data_size];
    if msg_in_ix != expected_message {
        return false;
    }

    true
}

#[derive(Accounts)]
pub struct ValidateBorrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    /// CHECK: InstructionsSysvar is a standard sysvar
    #[account(address = sysvar_instructions::ID)]
    pub instructions_sysvar: AccountInfo<'info>,
}

#[event]
pub struct BorrowApproved {
    pub user: Pubkey,
    pub score: u64,
    pub tier: u8,
    pub max_ltv: u8,
    pub timestamp: i64,
}

#[error_code]
pub enum FairLendError {
    #[msg("Attestation is too old")]
    StaleAttestation,
    #[msg("Timestamp is in the future")]
    InvalidTimestamp,
    #[msg("Signature Verification Failed")]
    InvalidSignature,
    #[msg("FairScore Tier too low to borrow")]
    TierTooLow,
}
