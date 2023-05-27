import {
  Box,
  Flex,
  HStack,
  Spacer,
  Link,
  VStack,
  Text,
  Divider,
  Button,
} from "@chakra-ui/react"
import WalletMultiButton from "@/components/WalletMultiButton"
import ItemCard from "@/components/ItemCard"
import { PublicKey } from "@solana/web3.js"

export default function Home() {
  const itemMintAddresses = [
    new PublicKey("4q8SQQ5sXsRMFKZfP3GRfW21hKsT1qvvHZX8XYZSm5BW"),
    new PublicKey("D2QDo3BCgwuTENjcFWoffRgBXLm53PajTqqJzeaC7GaB"),
    new PublicKey("2j5c4hJbP6tFrSAGEBtVayScM4WhKV9ouGUq8U7aGPQQ"),
  ]

  return (
    <Box>
      <Flex px={4} py={4}>
        <Spacer />
        <WalletMultiButton />
      </Flex>

      <VStack mb={10}>
        <Button
          as={Link}
          href="https://anchor-token-stake.vercel.app/"
          isExternal
        >
          Click Here To Get Tokens
        </Button>
      </VStack>

      <HStack justifyContent="center" spacing={4}>
        {itemMintAddresses.map((itemMint, index) => (
          <ItemCard key={index} purchaseMint={itemMint} />
        ))}
      </HStack>
    </Box>
  )
}
