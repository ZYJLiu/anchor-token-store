use anchor_lang::{
    prelude::*,
    solana_program::{pubkey, pubkey::Pubkey},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};

declare_id!("Ed3wfVH13QRrUXdnntkznQAkX4gvakg2PxDTpDSXik3A");

const PURCHASE_PRICE: u64 = 1;
const STORE_SEED: &[u8] = b"store";
// const PAYMENT_MINT: Pubkey = pubkey!("Gw1dRVus1Logbm3zNuJ8c5ae9AjWLK2So73kNUpqcucg");

#[program]
pub mod store {
    use super::*;

    pub fn buy(ctx: Context<Buy>) -> Result<()> {
        let amount = (PURCHASE_PRICE)
            .checked_mul(10u64.pow(ctx.accounts.payment_mint.decimals as u32))
            .unwrap();

        burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Burn {
                    from: ctx.accounts.payment_token_account.to_account_info(),
                    mint: ctx.accounts.payment_mint.to_account_info(),
                    authority: ctx.accounts.signer.to_account_info(),
                },
            ),
            amount,
        )?;

        let bump = *ctx.bumps.get("store_authority").unwrap();
        let signer: &[&[&[u8]]] = &[&[STORE_SEED, &[bump]]];

        mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.purchase_mint.to_account_info(),
                    to: ctx.accounts.purchase_token_account.to_account_info(),
                    authority: ctx.accounts.store_authority.to_account_info(),
                },
                signer,
            ),
            1,
        )?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        seeds = [STORE_SEED],
        bump,

    )]
    pub store_authority: SystemAccount<'info>,
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = signer
    )]
    pub payment_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        // address = PAYMENT_MINT // contraint to only allow hardcoded mint address for payment
    )]
    pub payment_mint: Account<'info, Mint>,
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = purchase_mint,
        associated_token::authority = signer
    )]
    pub purchase_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        mint::authority = store_authority.key(),
        mint::decimals = 0
    )]
    pub purchase_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}
