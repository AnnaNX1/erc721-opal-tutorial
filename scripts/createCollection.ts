import dotenv from 'dotenv'
import {ethers} from "hardhat"
import {CollectionHelpersFactory, UniqueNFTFactory} from "@unique-nft/solidity-interfaces"
import {CollectionManager__factory} from '../typechain-types'
import {Address} from "@unique-nft/utils";

dotenv.config()

const TOKEN_IPFS_CIDS = {
  1: 'QmZ8Syn28bEhZJKYeZCxUTM5Ut74ccKKDbQCqk5AuYsEnp',
  2: 'QmZVpSsjvxev3C8Dv4E44fSp8gGMP6aoLMp56HmZi5Wkxh',
  3: 'QmZMo8JDB9isA7k7tr8sFLXYwNJNa51XjJinkLWcc9vnta',
  4: 'QmV7fqfJBozrc7VtaHSd64GvwNYqoQE1QptaysenTJrbpL',
  5: 'QmSK1Zr6u2f2b8VgaFgz9CY1NR3JEyygQPQjJZaAA496Bh',
  6: 'QmafTK2uFRuLyir2zJpLSBMercq2nDfxtSiMWXL1dbqTDn',
  7: 'QmXTMYJ3rKeTCaQ79QQPe2EYcpVFbHr3maqJCPGcUobS4B',
  8: 'QmQa97BYq9se73AztVF4xG52fGSBVB1kZKtAtuhYLHE1NA',
}

async function main() {
  const myEthAddress = '0x161700Cec8Cf6696D022f9D148c857ad6e36E0d2'
  // Getting a substrate mirror. You must have tokes on it.
  console.log(Address.mirror.ethereumToSubstrate(myEthAddress))

  // define a provider
  const provider = ethers.provider

  // Creating a signer
  const privateKey = process.env.PRIVATE_KEY
  // @ts-ignore
  const wallet = new ethers.Wallet(privateKey, provider)
  const contractAddress = '0x5Bc3DDd28cEC80bb7Fb9C74e8A0920829AD896f5'

  // @ts-ignore
  const collectionHelpers = await CollectionHelpersFactory(wallet, ethers)

  // Creating a contract instance
  const contract = await ethers.getContractFactory('CollectionManager')
  const deployer = await contract.deploy()
  const collectionManager = await deployer.deployed()
  console.log(`Contract address found: ${collectionManager.address}`)

  // Creating a new collection
  let newCollection = await collectionManager.createCollection(
    myEthAddress,
    myEthAddress,
    'My new collection',
    'This collection is for testing purposes',
    'CL',
    'https://ipfs.unique.network/ipfs/',
    {
      value: await collectionHelpers.collectionCreationFee()
    }
  )

  const transactionReceipt = await newCollection.wait()
  const collectionAddress = transactionReceipt.events?.[0].args?.collectionId as string
  const collectionId = Address.collection.addressToId(collectionAddress)
  console.log(`Collection created!`)
  console.log(`Address: ${collectionAddress} , id: ${collectionId}`)

  // Minting NFTs
  const collection = await UniqueNFTFactory(collectionAddress, wallet, ethers)

  const txMintToken = await (await collection.mintWithTokenURI(
    wallet.address,
    'https://ipfs.unique.network/ipfs/' + TOKEN_IPFS_CIDS['1']
  )).wait()
  const tokenId = txMintToken.events?.[1].args?.tokenId.toNumber()
  const tokenUri = await collection.tokenURI(tokenId)
  console.log(`Successfully minted token #${tokenId}, it's URI is: ${tokenUri}`)

  /* Minting NFTs for all cids
  for (let cid in tokenIpfsCids) {
    const txMintToken = await (await collection.mintWithTokenURI(wallet.address, cid)).wait()
    const tokenId = txMintToken.events?.[0].args?.tokenId.toNumber()
    const tokenUri = await collection.tokenURI(tokenId)
    console.log(`Successfully minted token #${tokenId}, it's URI is: ${tokenUri}`)
  }*/
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
