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
  const [metadata, setMetadata] = useState<Sft>()

  const paymentMint = new PublicKey(
    "Gw1dRVus1Logbm3zNuJ8c5ae9AjWLK2So73kNUpqcucg"
  )

  const handleClick = async () => {
    setIsLoading(true)

    const [storeAuthorityPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from("store")],
      program!.programId
    )

    const paymentTokenAccount = getAssociatedTokenAddressSync(
      paymentMint,
      publicKey!
    )

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
