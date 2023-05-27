import { Box, Flex, HStack, Spacer } from "@chakra-ui/react"
import WalletMultiButton from "@/components/WalletMultiButton"
import ItemCard from "@/components/ItemCard"
import { PublicKey } from "@solana/web3.js"

export default function Home() {
  const itemMintAddresses = [
    new PublicKey("J7vLrZDzFzmsagpWACqQUEg5k3JGRzxQHS1QE8PXTC8X"),
    new PublicKey("EzgDYGT1u6PcqmLW5nzA42BRHH8tcDFAJKmRxi3dx9PQ"),
    new PublicKey("CU9pFnUKa7FkxxvQRK8ECKZwLmPaPTvueNccpHKq3gbJ"),
  ]

  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>

      <HStack justifyContent="center" spacing={4}>
        {itemMintAddresses.map((itemMint, index) => (
          <ItemCard key={index} purchaseMint={itemMint} />
        ))}
      </HStack>
    </Box>
  )
}
