import {
  Box,
  Flex,
  HStack,
  Spacer,
  Link,
  VStack,
  Button,
} from "@chakra-ui/react"
import WalletMultiButton from "@/components/WalletMultiButton"
import ItemCard from "@/components/ItemCard"
import { PublicKey } from "@solana/web3.js"

export default function Home() {
  // Mint addresses for the items to display
  // These should have been created already, and the mint authority set as the store authority PDA
  const itemMintAddresses = [
    new PublicKey("fYv7DL1cRRjj1h3KtNFhpmHniZF31LNrMBH7MVytUKV"),
    new PublicKey("9RcpPCkxs3PWT4fP2U64eh6Qgt124i97BREtj9wrgDe1"),
    new PublicKey("BRxnpHWC9FGCdiZEwKwyWQiRRceaCwjBYum7tRNvqPM9"),
  ]

  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>

      {/* Display Button which redirects to token staking frontend to get tokens */}
      <VStack mb={10}>
        <Button
          as={Link}
          href="https://anchor-token-stake.vercel.app/"
          isExternal
        >
          Click Here To Get Tokens
        </Button>
      </VStack>

      {/* Display the items available for purchase */}
      <HStack justifyContent="center" spacing={4}>
        {itemMintAddresses.map((itemMint, index) => (
          <ItemCard key={index} purchaseMint={itemMint} />
        ))}
      </HStack>
    </Box>
  )
}
