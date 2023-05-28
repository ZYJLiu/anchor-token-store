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

  // Mint address for token accepted by the store as payment
  let paymentMint: PublicKey
  // User's token account for the paymentMint token
  let paymentTokenAccount: PublicKey
  // Mint address for token purchased by the user
  let purchaseMintOne: PublicKey
  // User's token account for the "purchaseMintOne" token
  let purchaseTokenAccountOne: PublicKey
  // Mint address for token purchased by the user
  let purchaseMintTwo: PublicKey
  // User's token account for the "purchaseMintTwo" token
  let purchaseTokenAccountTwo: PublicKey

  // PDA for the store authority, used as mint authority for the purchase tokens
  // Using PDA as mint authority enables minting directly from the program
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

    // Mint some tokens to initially fund the user to pay for the purchase
    await mintTo(
      connection,
      wallet.payer, // Payer
      paymentMint, // Mint
      paymentTokenAccount, // Destination
      wallet.payer, // Mint authority
      100 * 10 ** 2 // Amount, minting 1 token, accounting for decimals (2)
    )

    // Create a mint to test, this is an item that the user will purchase
    purchaseMintOne = await createMint(
      connection,
      wallet.payer, // Payer
      storeAuthorityPDA, // Mint authority (set as store authority PDA)
      null, // Freeze authority
      0 // Decimals (no decimals for "semi-fungible" tokens)
    )

    // Create a token account address for the user
    // This is where the user will receive the purchased tokens
    purchaseTokenAccountOne = getAssociatedTokenAddressSync(
      purchaseMintOne,
      wallet.publicKey
    )

    // Create a second mint to test
    purchaseMintTwo = await createMint(
      connection,
      wallet.payer, // Payer
      storeAuthorityPDA, // Mint authority (set as store authority PDA)
      null, // Freeze authority
      0 // Decimals (no decimals for "semi-fungible" tokens)
    )

    // Create a token account address for the user
    // This is where the user will receive the purchased tokens
    purchaseTokenAccountTwo = getAssociatedTokenAddressSync(
      purchaseMintTwo,
      wallet.publicKey
    )
  })

  it("Buy First Token", async () => {
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

  it("Buy Second Token", async () => {
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

  // Not used to test program
  // Just using to create tokens with metadata to test with frontend
  it("Create Multiple Fungible Tokens with Metadata", async () => {
    // Set up metaplex client
    const metaplex = new Metaplex(connection).use(keypairIdentity(wallet))

    // Test uris
    const uris = [
      "https://madlads.s3.us-west-2.amazonaws.com/json/8566.json",
      "https://madlads.s3.us-west-2.amazonaws.com/json/2382.json",
      "https://madlads.s3.us-west-2.amazonaws.com/json/7592.json",
    ]

    // call helper function
    createMultipleFungibleTokens(uris)

    // Helper function to create multiple fungible tokens
    async function createMultipleFungibleTokens(uris) {
      for (const uri of uris) {
        // Use metaplex client to create a new fungible token
        const fungibleToken = await metaplex.nfts().createSft({
          uri: uri,
          name: "JPEG",
          sellerFeeBasisPoints: 100,
          updateAuthority: wallet.payer,
          mintAuthority: wallet.payer,
          decimals: 0,
          tokenStandard: 1,
          symbol: "JPEG",
          isMutable: true,
        })

        // Log the mint address
        console.log(`Mint: ${fungibleToken.mintAddress}`)

        // Transfer mint authority to the store authority PDA
        await setAuthority(
          connection,
          wallet.payer, // Payer
          fungibleToken.mintAddress, // Mint
          wallet.publicKey, // Current authority
          AuthorityType.MintTokens, // Authority type
          storeAuthorityPDA // New authority
        )
      }
    }
  })
})
