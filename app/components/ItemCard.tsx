import { useEffect, useState } from "react"
import { Button, Image, VStack } from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { useProgram } from "@/contexts/ProgramContext"
import { PublicKey } from "@solana/web3.js"
import { getAssociatedTokenAddressSync } from "@solana/spl-token"
import { Metaplex, Sft } from "@metaplex-foundation/js"

type ItemCardProps = {
  purchaseMint: PublicKey
}

const ItemCard = ({ purchaseMint }: ItemCardProps) => {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { program } = useProgram()
  const [isLoading, setIsLoading] = useState(false)

  // State variable to hold the metadata for the fungible token
  const [metadata, setMetadata] = useState<Sft>()

  // Mint address of token accepted for payment
  const paymentMint = new PublicKey(
    "Gw1dRVus1Logbm3zNuJ8c5ae9AjWLK2So73kNUpqcucg"
  )

  const handleClick = async () => {
    setIsLoading(true)

    // Get the PDA for the store authority (the mint authority of the purchase token)
    // This address is only used for the program to "sign" for minting of the purchase token
    const [storeAuthorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("store")],
      program!.programId
    )

    // Get the user's associated token account address for the payment token
    // Tokens burn from this account
    const paymentTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      publicKey!
    )

    // Get the user's associated token account address for the purchase token
    // Token minted to this account, this account is created if it doesn't exist
    const purchaseTokenAccountOne = getAssociatedTokenAddressSync(
      purchaseMint,
      publicKey!
    )

    try {
      const tx = await program!.methods
        .buy()
        .accounts({
          signer: publicKey!,
          storeAuthority: storeAuthorityPDA,
          paymentTokenAccount: paymentTokenAccount,
          paymentMint: paymentMint,
          purchaseTokenAccount: purchaseTokenAccountOne,
          purchaseMint: purchaseMint,
        })
        .transaction()

      const txSig = await sendTransaction(tx, connection)
      console.log(`https://explorer.solana.com/tx/${txSig}?cluster=devnet`)
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Use metaplex to fetch the metadata for the fungible token
  // This is used to display the image of the token, but additional metadata is also available
  useEffect(() => {
    const fetchMetadata = async () => {
      const metaplex = new Metaplex(connection)

      const metadata = await metaplex
        .nfts()
        .findByMint({ mintAddress: purchaseMint })

      setMetadata(metadata as Sft)
    }
    fetchMetadata()
  }, [])

  return (
    <VStack>
      <Image
        width="300px"
        borderRadius="10"
        src={metadata?.json?.image}
        alt=""
      />
      <Button
        w="100px"
        onClick={handleClick}
        isLoading={isLoading}
        isDisabled={!publicKey}
      >
        Purchase
      </Button>
    </VStack>
  )
}

export default ItemCard
