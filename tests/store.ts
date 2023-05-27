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
import { keypairIdentity, Metaplex } from "@metaplex-foundation/js"

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
      100 * 10 ** 2 // Amount, minting 1 token, accounting for decimals (2)
    )

    // Create a mint to test
    purchaseMintOne = await createMint(
      connection,
      wallet.payer, // Payer
      storeAuthorityPDA, // Mint authority
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
      storeAuthorityPDA, // Mint authority
      null, // Freeze authority
      0 // Decimals (no decimals for "semi-fungible" tokens)
    )

    purchaseTokenAccountTwo = getAssociatedTokenAddressSync(
      purchaseMintTwo,
      wallet.publicKey
    )

    purchaseTokenAccountOne = getAssociatedTokenAddressSync(
      purchaseMintOne,
      wallet.publicKey
    )
  })

  it("Is initialized!", async () => {
    console.log("storeAuthorityPDA", storeAuthorityPDA.toBase58())
    console.log("paymentMint", paymentMint.toBase58())
    console.log("paymentTokenAccount", paymentTokenAccount.toBase58())
    console.log("purchaseMintOne", purchaseMintOne.toBase58())
    console.log("purchaseTokenAccountOne", purchaseTokenAccountOne.toBase58())
    console.log("purchaseMintTwo", purchaseMintTwo.toBase58())
    console.log("purchaseTokenAccountTwo", purchaseTokenAccountTwo.toBase58())

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

  it("Create Multiple Fungible Tokens with Metadata", async () => {
    const metaplex = new Metaplex(connection).use(keypairIdentity(wallet))

    const uris = [
      "https://madlads.s3.us-west-2.amazonaws.com/json/8566.json",
      "https://madlads.s3.us-west-2.amazonaws.com/json/2382.json",
      "https://madlads.s3.us-west-2.amazonaws.com/json/7592.json",
    ]

    createMultipleFungibleTokens(uris)

    async function createMultipleFungibleTokens(uris) {
      for (const uri of uris) {
        const fungibleToken = await metaplex.nfts().createSft({
          uri: uri,
          name: "madlads.s3",
          sellerFeeBasisPoints: 100,
          updateAuthority: wallet.payer,
          mintAuthority: wallet.payer,
          decimals: 0,
          tokenStandard: 1,
          symbol: "us-west-2",
          isMutable: true,
        })

        // Log the mint address
        console.log(`Mint: ${fungibleToken.mintAddress}`)

        // Transfer mint authority to the store authority PDA
        await setAuthority(
          connection,
          wallet.payer,
          fungibleToken.mintAddress,
          wallet.publicKey,
          AuthorityType.MintTokens,
          storeAuthorityPDA
        )
      }
    }
  })
})
