import * as anchor from "@coral-xyz/anchor"
import { Program } from "@coral-xyz/anchor"
import { Store } from "../target/types/store"
import { PublicKey } from "@solana/web3.js"
import {
  AuthorityType,
  createAssociatedTokenAccount,
  createMint,
  getAssociatedTokenAddressSync,
  mintTo,
  setAuthority,
} from "@solana/spl-token"

describe("store", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env())

  const program = anchor.workspace.Store as Program<Store>
  const wallet = anchor.workspace.Store.provider.wallet
  const connection = program.provider.connection

  let paymentMint: PublicKey
  let paymentTokenAccount: PublicKey
  let purchaseMintOne: PublicKey
  let purchaseTokenAccountOne: PublicKey
  let purchaseMintTwo: PublicKey
  let purchaseTokenAccountTwo: PublicKey

  const [storeAuthorityPDA] = PublicKey.findProgramAddressSync(
    [Buffer.from("store")],
    program.programId
  )

  before(async () => {
    // Create a mint to test
    paymentMint = await createMint(
      connection,
      wallet.payer, // Payer
      wallet.publicKey, // Mint authority
      null, // Freeze authority
      2 // Decimals (no decimals for "semi-fungible" tokens)
    )

    // Create a token account for the player
    paymentTokenAccount = await createAssociatedTokenAccount(
      connection,
      wallet.payer, // Payer
      paymentMint, // Mint
      wallet.publicKey // Owner
    )

    // Mint some tokens
    await mintTo(
      connection,
      wallet.payer, // Payer
      paymentMint, // Mint
      paymentTokenAccount, // Destination
      wallet.payer, // Mint authority
      2 * 10 ** 2 // Amount, minting 1 token, accounting for decimals (2)
    )

    // Create a mint to test
    purchaseMintOne = await createMint(
      connection,
      wallet.payer, // Payer
      wallet.publicKey, // Mint authority
      null, // Freeze authority
      0 // Decimals (no decimals for "semi-fungible" tokens)
    )

    purchaseTokenAccountOne = getAssociatedTokenAddressSync(
      purchaseMintOne,
      wallet.publicKey
    )

    // Create a mint to test
    purchaseMintTwo = await createMint(
      connection,
      wallet.payer, // Payer
      wallet.publicKey, // Mint authority
      null, // Freeze authority
      0 // Decimals (no decimals for "semi-fungible" tokens)
    )

    purchaseTokenAccountTwo = getAssociatedTokenAddressSync(
      purchaseMintTwo,
      wallet.publicKey
    )

    // Transfer mint authority to the store authority PDA
    await setAuthority(
      connection,
      wallet.payer,
      purchaseMintOne,
      wallet.publicKey,
      AuthorityType.MintTokens,
      storeAuthorityPDA
    )

    // Transfer mint authority to the store authority PDA
    await setAuthority(
      connection,
      wallet.payer,
      purchaseMintTwo,
      wallet.publicKey,
      AuthorityType.MintTokens,
      storeAuthorityPDA
    )
  })

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .buy()
      .accounts({
        signer: wallet.publicKey,
        storeAuthority: storeAuthorityPDA,
        paymentTokenAccount: paymentTokenAccount,
        paymentMint: paymentMint,
        purchaseTokenAccount: purchaseTokenAccountOne,
        purchaseMint: purchaseMintOne,
      })
      .rpc()
    console.log("Your transaction signature", tx)

    const paymentTokenbalance = await connection.getTokenAccountBalance(
      paymentTokenAccount
    )

    const purchaseTokenbalance = await connection.getTokenAccountBalance(
      purchaseTokenAccountOne
    )

    console.log("paymentTokenbalance", paymentTokenbalance.value.uiAmount)

    console.log("purchaseTokenbalance", purchaseTokenbalance.value.uiAmount)
  })

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods
      .buy()
      .accounts({
        signer: wallet.publicKey,
        storeAuthority: storeAuthorityPDA,
        paymentTokenAccount: paymentTokenAccount,
        paymentMint: paymentMint,
        purchaseTokenAccount: purchaseTokenAccountTwo,
        purchaseMint: purchaseMintTwo,
      })
      .rpc()
    console.log("Your transaction signature", tx)

    const paymentTokenbalance = await connection.getTokenAccountBalance(
      paymentTokenAccount
    )

    const purchaseTokenbalance = await connection.getTokenAccountBalance(
      purchaseTokenAccountTwo
    )

    console.log("paymentTokenbalance", paymentTokenbalance.value.uiAmount)

    console.log("purchaseTokenbalance", purchaseTokenbalance.value.uiAmount)
  })
})
