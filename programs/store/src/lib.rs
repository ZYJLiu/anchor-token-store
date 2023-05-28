use anchor_lang::{
    prelude::*,
    solana_program::{pubkey, pubkey::Pubkey},
};
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};

declare_id!("Ed3wfVH13QRrUXdnntkznQAkX4gvakg2PxDTpDSXik3A");

// Item purchase price
const PURCHASE_PRICE: u64 = 1;
// Seed for store authority PDA, which is only used as mint authority for items
const STORE_SEED: &[u8] = b"store";

// // Hardcoded mint address for payment
// const PAYMENT_MINT: Pubkey = pubkey!("Gw1dRVus1Logbm3zNuJ8c5ae9AjWLK2So73kNUpqcucg");

#[program]
pub mod store {
    use super::*;

    // Instruction to buy an item
    pub fn buy(ctx: Context<Buy>) -> Result<()> {
        // Calculate amount, adjust for decimals
        let amount = (PURCHASE_PRICE)
            .checked_mul(10u64.pow(ctx.accounts.payment_mint.decimals as u32))
            .unwrap();

        // Burn payment token
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

        // Mint Authority PDA signer
        let bump = *ctx.bumps.get("store_authority").unwrap();
        let signer: &[&[&[u8]]] = &[&[STORE_SEED, &[bump]]];

        // Mint purchase token to buyer
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
    // User paying for item
    #[account(mut)]
    pub signer: Signer<'info>,

    // Store authority PDA, this only used as mint authority for items
    // This is a system account, because it was never initialized
    #[account(
        seeds = [STORE_SEED],
        bump,

    )]
    pub store_authority: SystemAccount<'info>,

    // Payment token account, tokens will be burned from this account
    #[account(
        mut,
        associated_token::mint = payment_mint,
        associated_token::authority = signer
    )]
    pub payment_token_account: Account<'info, TokenAccount>,

    // Payment token mint, tokens accepted for payment
    #[account(
        mut,
        // address = PAYMENT_MINT // contraint to only allow hardcoded mint address for payment
    )]
    pub payment_mint: Account<'info, Mint>,

    // Signer's Token account for the item being purchased , tokens will be minted to this account
    // This is an associated token account, and will be created if it doesn't exist
    #[account(
        init_if_needed,
        payer = signer,
        associated_token::mint = purchase_mint,
        associated_token::authority = signer
    )]
    pub purchase_token_account: Account<'info, TokenAccount>,

    // Mint for the item being purchased
    // Must already exist, and the mint authority must be the store authority PDA
    // The mint can be created using Metaplex js, and then transfer mint authority to the store authority PDA
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
