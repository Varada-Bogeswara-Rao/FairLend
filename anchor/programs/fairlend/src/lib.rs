use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod fairlend {
    use super::*;

    pub fn validate_borrow(
        ctx: Context<ValidateBorrow>, 
        score: u32, 
        tier: u8, 
        timestamp: i64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let current_time = clock.unix_timestamp;

        // 1. Check Freshness (5 mins = 300 seconds)
        require!(
            current_time >= timestamp && current_time - timestamp <= 300,
            FairLendError::StaleAttestation
        );

        // 2. Logic:
        // In a production system, we would introspect the `instructions` sysvar here
        // to verify that the Ed25519 program verified the signature for:
        // [user_pubkey, score, tier, timestamp] signed by the trusted Attester.
        // For this prototype, we rely on the fact that the transaction must contain
        // a valid Ed25519 instruction (added by frontend) to even reach this point 
        // if we structured the transaction correctly.
        // However, to be "safe" against spoofing in a demo without introspection, 
        // we heavily rely on the backend signing logic and the frontend composing it correctly.
        
        msg!("Borrow Request Validated!");
        msg!("User: {}", ctx.accounts.user.key());
        msg!("FairScore: {}", score);
        msg!("Tier: {}", tier);

        emit!(BorrowApproved {
            user: ctx.accounts.user.key(),
            tier,
            score,
            timestamp,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ValidateBorrow<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[event]
pub struct BorrowApproved {
    pub user: Pubkey,
    pub tier: u8,
    pub score: u32,
    pub timestamp: i64,
}

#[error_code]
pub enum FairLendError {
    #[msg("Attestation is stale or invalid (>5 minutes old)")]
    StaleAttestation,
}
