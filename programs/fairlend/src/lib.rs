use anchor_lang::prelude::*;

declare_id!("H8Xjw5efShAHNmKL1fJQs1VMNbSc996y1NavEEwLMSdR");

#[program]
pub mod fairlend {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
